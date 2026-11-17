// Browser E2E substitute for React Native's Alert (Metro alias under
// TABI_E2E=1). react-native-web's Alert does nothing, which would hide every
// confirmation. This renders the same title, message and buttons as an
// accessible dialog; pressing a button closes it and runs its handler, like
// the native alert.

type AlertButton = Readonly<{
  text?: string
  style?: 'default' | 'cancel' | 'destructive'
  onPress?: () => void
}>

function alert(
  title: string,
  message?: string,
  buttons: readonly AlertButton[] = [{ text: 'OK' }],
): void {
  const dialog = document.createElement('div')
  dialog.setAttribute('role', 'alertdialog')
  dialog.setAttribute('aria-modal', 'true')
  dialog.setAttribute('aria-label', title)
  dialog.style.cssText =
    'position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;justify-content:center;gap:8px;padding:24px;background:rgba(0,0,0,.45);color:#fff'
  const heading = document.createElement('h2')
  heading.textContent = title
  dialog.append(heading)
  if (message) {
    const body = document.createElement('p')
    body.textContent = message
    dialog.append(body)
  }
  for (const button of buttons) {
    const element = document.createElement('button')
    element.type = 'button'
    element.textContent = button.text ?? 'OK'
    element.addEventListener('click', () => {
      dialog.remove()
      button.onPress?.()
    })
    dialog.append(element)
  }
  document.body.append(dialog)
}

// oxlint-disable-next-line import/no-default-export -- react-native-webのAlertモジュール（default export）を置き換えるため。
export default { alert }
