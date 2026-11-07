import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript'

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(
    (error) => {
      if (directory === 'src' && error.code === 'ENOENT') {
        return []
      }
      throw error
    },
  )
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? files(path.join(directory, entry.name))
          : [path.join(directory, entry.name)],
      ),
    )
  ).flat()
}
const failures = []
const sourceFiles = await files('src')
for (const file of sourceFiles) {
  if (!/\.[cm]?[jt]sx?$/.test(file)) {
    continue
  }
  const normalized = file.split(path.sep).join('/')
  const common = normalized.startsWith('src/components/')
  const pure = /\/(logic|domain)\//.test(normalized)
  const source = ts.createSourceFile(
    file,
    await readFile(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  )
  function getModuleSpecifier(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      return node.moduleSpecifier.text
    }
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          node.expression.text === 'require'))
    ) {
      if (
        node.arguments.length === 1 &&
        ts.isStringLiteral(node.arguments[0])
      ) {
        return node.arguments[0].text
      } else if (common || pure) {
        failures.push(`${file}: nonliteral module loading is forbidden`)
      }
    }
    return undefined
  }
  function visit(node) {
    const value = getModuleSpecifier(node)
    if (value) {
      const target = value.startsWith('.')
        ? path.resolve(path.dirname(file), value).split(path.sep).join('/')
        : value
      const storage = /(^|\/)storage(\/|$)/.test(target)
      const native =
        /^(expo($|-)|@expo\/|react-native($|-)|@react-native\/|@react-native-community\/|lucide-react-native)/.test(
          value,
        )
      if (
        common &&
        (storage || /^(expo-sqlite|expo-file-system)(\/|$)/.test(value))
      ) {
        failures.push(`${file}: UI cannot import ${value}`)
      }
      if (
        pure &&
        (storage ||
          native ||
          (/\/(components|app|features)\//.test(target) &&
            !/\/(logic|domain)\//.test(target)))
      ) {
        failures.push(`${file}: pure logic cannot import ${value}`)
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
}
if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else if (sourceFiles.length === 0) {
  console.log('No src files: dependency boundary check has no targets yet.')
} else {
  console.log('Dependency boundaries passed (components, **/logic, **/domain).')
}
