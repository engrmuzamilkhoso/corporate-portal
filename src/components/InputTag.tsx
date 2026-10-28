import { CBadge } from "@coreui/react-pro"

interface InputTagProps {
    index: number;
    value: string;
    onRemove?: (index: number) => void;
    disabled: boolean;
}

const InputTag = ({index, value, onRemove, disabled}: InputTagProps) => {
    return (
        <CBadge
            key={index}
            size='sm'
            className={`required-headers-tag fw-normal me-2 mb-2 p-2 d-inline-flex align-items-center ${
                disabled ? "required-headers-tag-disabled" : ""
            }`}
            >
            {value}
            <button
                type="button"
                onClick={() => onRemove?.(index)}
                className={`required-headers-remove-btn ms-2 ${
                disabled ? "required-headers-remove-btn-disabled" : ""
                }`}
            >
                &times;
            </button>
        </CBadge>
    )
}

export default InputTag;