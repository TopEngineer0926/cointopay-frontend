import translate from './libs/translate'
import moment from 'moment'

export default function () {
  const showError = (errorBag, key, msg = '') => {
    if (Object.keys(errorBag).length > 0 && typeof errorBag[key] !== 'undefined') {
      return msg !== '' ? msg : errorBag[key]
    }
    return ''
  }
  const getValue = (data, field) => {
    let value = ''
    if (field) {
      field = field.split('.')
      if (field.length > 1) {
        field.forEach(f => {
          value = value === '' ? data[f] : value[f]
        })
      } else {
        value = data[field[0]]
      }
    }
    return value
  }
  const getError = (messages, field, rule, message) => {
    if (messages && typeof messages[field] !== 'undefined' && typeof messages[field][rule] !== 'undefined') {
      return messages[field][rule]
    } else {
      return message
    }
  }
  const processValidation = (data, fieldRules, fieldValue, errorBag, field, messages) => {
    for (const rule of fieldRules) {
      const ruleArray = rule.split(':')
      let action = rule
      if (ruleArray.length > 1) {
        action = ruleArray[0]
      }
      switch (action) {
        case 'required':
          if (!fieldValue || fieldValue === '' || fieldValue === null || fieldValue.length === 0) {
            errorBag[field] = getError(messages, field, 'required', translate('errors.required'))
          }
          break
        case 'required_if':
          if (!fieldValue || fieldValue === '' || fieldValue === null || fieldValue.length === 0) {
            const ruleArray = rule.split(/[:,]/g)
            const targetFieldValue = getValue(data, ruleArray[1])
            const values = []
            for (let i = 2; i < ruleArray.length; i++) {
              values.push(ruleArray[i])
            }
            if (values.indexOf(targetFieldValue.toString()) !== -1) {
              errorBag[field] = getError(messages, field, 'required', translate('errors.required'))
            }
          }
          break
        case 'url':
          if (fieldValue) {
            const res = fieldValue.match(/(http(s)?:\/\/.)(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g)
            if (res === null) {
              errorBag[field] = getError(messages, field, 'url', translate('errors.invalid_url') + ' format: http(s)://example.com')
            }
          }
          break
        case 'max':
          if (fieldValue) {
            const ruleArray = rule.split(/[:]/g)
            if (fieldValue.length > Number(ruleArray[1])) {
              errorBag[field] = getError(messages, field, 'max', translate('errors.max_len') + ruleArray[1])
            }
          }
          break
        case 'min':
          if (fieldValue) {
            const ruleArray = rule.split(/[:]/g)
            if (fieldValue.length < Number(ruleArray[1])) {
              errorBag[field] = getError(messages, field, 'min', translate('errors.min_len') + ruleArray[1])
            }
          }
          break
        case 'confirm':
          if (fieldValue) {
            const ruleArray = rule.split(/[:]/g)
            const targetFieldValue = getValue(data, ruleArray[1])
            if (fieldValue !== targetFieldValue) {
              errorBag[field] = getError(messages, field, 'confirm', translate('errors.no_match'))
            }
          }
          break
        case 'email':
          if (fieldValue) {
            const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            if (!re.test(String(fieldValue).toLowerCase())) {
              errorBag[field] = getError(messages, field, 'email', translate('errors.invalid_email'))
            }
          }
          break
        case 'password':
          if (fieldValue) {
            const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,20}$/
            if (!re.test(String(fieldValue))) {
              if (messages && typeof messages[field].regex !== 'undefined') {
                errorBag[field] = messages[field].regex
              } else {
                errorBag[field] = getError(messages, field, 'password', translate('errors.invalid_password_criteria'))
              }
            }
          }
          break
        case 'minValue':
          if (fieldValue) {
            const ruleArray = rule.split(/[:]/g)
            if (Number(fieldValue) < Number(ruleArray[1])) {
              if (messages && typeof messages[field].minValue !== 'undefined') {
                errorBag[field] = messages[field].minValue
              } else {
                errorBag[field] = getError(messages, field, 'minValue', translate('errors.min') + ruleArray[1])
              }
            }
          }
          break
        case 'decimal':
          if (fieldValue) {
            const ruleArray = rule.split(/[:]/g)
            const len = ruleArray.length === 2 ? ruleArray[1] : 2
            const re = new RegExp(`^\\d+(\\.\\d{0,${len}})?$`)
            if (!re.test(fieldValue)) {
              errorBag[field] = getError(messages, field, 'decimal', translate('errors.invalid_decimal') + ': ' + (len === 2 ? '2.99' : '0.00000001'))
            }
          }
          break
        case 'numeric':
          if (fieldValue) {
            if (isNaN(fieldValue)) {
              errorBag[field] = getError(messages, field, 'numeric', translate('errors.numeric'))
            }
          }
          break
        case 'date':
          if (fieldValue) {
            if (!moment(fieldValue, 'YYYY-MM-DD', true).isValid()) {
              errorBag[field] = getError(messages, field, 'date', translate('errors.invalid_date') + ': 1970-12-31')
            }
          }
          break
        case 'phone':
          if (fieldValue) {
            const re = /^\+?\d+$/
            if (!re.test(fieldValue)) {
              errorBag[field] = getError(messages, field, 'phone', translate('errors.invalid_phone') + ': +370000000000')
            }
          }
          break
        case 'regex':
          if (fieldValue) {
            const ruleArray = rule.split('regex:')
            const re = new RegExp(ruleArray[1].substring(1, ruleArray[1].length - 1))
            if (!re.test(fieldValue)) {
              errorBag[field] = getError(messages, field, 'regex', translate('errors.invalid_format'))
            }
          }
          break
        case 'between':
          if (fieldValue) {
            const ruleArray = rule.split(/[:,]/g)
            if (ruleArray.length === 3) {
              if (!between(Number(ruleArray[1]), Number(ruleArray[2]), fieldValue)) {
                errorBag[field] = getError(messages, field, 'between', `Number should be between ${ruleArray[1]} and ${ruleArray[2]}`)
              }
            }
          }
      }
    }
  }
  const validate = (data, rules, messages = null) => {
    const errorBag = {}
    for (const field of Object.keys(rules)) {
      const fieldRules = rules[field]
      let fieldValue
      if (field.indexOf('*') !== -1) {
        const fieldParts = field.split('.*.')
        let count = 0
        data[fieldParts[0]].forEach(r => {
          if (typeof r === 'object') {
            Object.keys(r).forEach(key => {
              const f = `${fieldParts[0]}.${count}.${key}`
              processValidation(data, fieldRules, r[key], errorBag, f, messages)
            })
          }
          count++
        })
      } else {
        fieldValue = getValue(data, field)
        if (typeof fieldValue === 'string') {
          fieldValue = fieldValue ? fieldValue.trim() : fieldValue
        }
        if (typeof fieldValue === 'object') {
          // eslint-disable-next-line no-empty
          if (fieldValue instanceof Date) {
          } else {
            if (Array.isArray(fieldValue)) {
              fieldValue = fieldValue.filter(value => {
                return (typeof value !== 'object') ? value.trim() : value
              })
            } else {
              if (fieldValue !== null) {
                fieldValue = Object.keys(fieldValue).filter(value => value.trim())
              }
            }
          }
        }
        processValidation(data, fieldRules, fieldValue, errorBag, field, messages)
      }
    }
    return errorBag
  }

  const between = (a, b, val) => {
    const min = Math.min(a, b)
    const max = Math.max(a, b)
    return val > min && val < max
  }

  return {
    showError,
    validate
  }
}
