import { componentReturn } from './component-return.ts'
import { multilineProps } from './multiline-props.ts'
import { noLet } from './no-let.ts'
import { propsComponentSpacing } from './props-component-spacing.ts'
import { readonlyProps } from './readonly-props.ts'
import { requireDisableReason } from './require-disable-reason.ts'
import { requireDisableRules } from './require-disable-rules.ts'

export default {
  meta: { name: 'tabi-log' },
  rules: {
    'component-return': componentReturn,
    'no-let': noLet,
    'props-component-spacing': propsComponentSpacing,
    'multiline-props': multilineProps,
    'readonly-props': readonlyProps,
    'require-disable-reason': requireDisableReason,
    'require-disable-rules': requireDisableRules,
  },
}
