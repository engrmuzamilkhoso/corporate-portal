type DataItem = {
  id?: number | string | null
  code?: number | string | null
  name?: string | null
  label?: string | null
  companyTitle?: string | null
}

type FormattedItem = {
  id: number | string
  code: string | number
  name: string
  label: string
}

type StringTransformFn = ((input: string) => string) | null | undefined

export function formatDataList(
  data: DataItem[] | null | undefined,
  transformFn?: StringTransformFn,
): FormattedItem[] {
  if (!Array.isArray(data)) return []

  return data.map((item) => {
    const id = item.id ?? item.code!
    const name = item.name ?? item.label ?? item.companyTitle ?? 'Unknown' // Use name, fallback to label
    const formattedName = transformFn ? transformFn(name) : name // Apply transformation if provided

    return { id, code: id, name: formattedName, label: formattedName }
  })
}
