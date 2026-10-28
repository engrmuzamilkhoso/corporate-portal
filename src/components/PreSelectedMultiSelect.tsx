type PreSelectedItem = {
  value: number | string
  label: string
  selected?: boolean
}

type PreSelectedListProps = {
  list: PreSelectedItem[] | string[]
}

const PreSelectedList = ({ list }: PreSelectedListProps) => {
  let normalizedList: PreSelectedItem[]

  // this will allow the component to accept a list of strings and render them
  if (typeof list[0] === 'string') {
    normalizedList = (list as string[]).map((str, idx) => ({
      value: idx,
      label: str,
      selected: true,
    }))
  } else {
    normalizedList = list as PreSelectedItem[]
  }

  return (
    <div className="custom-multi-select scrollable">
      <div className="custom-multi-select-input-group">
        {normalizedList
          .filter((item) => item.selected)
          .map((item) => (
            <span key={item.value} className="custom-multi-select-tag">
              {item.label}
            </span>
          ))}
      </div>
    </div>
  )
}

export default PreSelectedList
