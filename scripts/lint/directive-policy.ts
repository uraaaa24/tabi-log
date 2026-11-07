import ts from 'typescript'

export const inspectDirectiveComments = (text: string, filename: string) => {
  const source = ts.createSourceFile(
    filename,
    text,
    ts.ScriptTarget.Latest,
    true,
  )
  const comments = new Map<number, ts.CommentRange>()
  const jsxTextRanges: { pos: number; end: number }[] = []
  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node)) {
      jsxTextRanges.push({ pos: node.pos, end: node.end })
      return
    }
    for (const range of ts.getLeadingCommentRanges(text, node.pos) ?? []) {
      comments.set(range.pos, range)
    }
    for (const range of ts.getTrailingCommentRanges(text, node.end) ?? []) {
      comments.set(range.pos, range)
    }
    for (const child of node.getChildren(source)) {
      visit(child)
    }
  }
  visit(source)
  return [...comments.values()].flatMap((range) => {
    if (
      jsxTextRanges.some(
        (textRange) => range.pos >= textRange.pos && range.pos < textRange.end,
      )
    ) {
      return []
    }
    const raw = text.slice(
      range.pos + 2,
      range.end - (range.kind === ts.SyntaxKind.MultiLineCommentTrivia ? 2 : 0),
    )
    const directive =
      /^\s*(?:oxlint|eslint)-disable(?:-next-line|-line)?(?=\s|$)([\s\S]*)$/u.exec(
        raw,
      )
    if (!directive) {
      return []
    }
    const rules = directive[1].split(/\s--(?:\s|$)/u)[0]
    const problems = [
      ...(!rules.split(',').some((rule) => rule.trim().length > 0)
        ? ['Specify the rules to disable.']
        : []),
      ...(!/\s--\s+\S/u.test(raw) ? ['Provide a reason after " -- ".'] : []),
    ]
    const location = source.getLineAndCharacterOfPosition(range.pos)
    return problems.map(
      (message) =>
        `${filename}:${location.line + 1}:${location.character + 1}: ${message}`,
    )
  })
}
