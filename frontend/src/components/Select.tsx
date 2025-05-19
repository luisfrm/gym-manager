import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

type Props = {
  onValueChange: (value: string) => void;
  items: { value: string; label: string }[];
  defaultValue: string;
  placeholder: string;
  className?: string;
};

const SelectComponent = ({ onValueChange, items, defaultValue, placeholder, className = "" }: Props) => {
  return (
    <Select onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue defaultValue={defaultValue} placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map(item => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectComponent;
