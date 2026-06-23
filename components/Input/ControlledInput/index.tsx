import { Control, Controller, FieldValues, Path } from "react-hook-form";
import Input, { IInputProps } from "..";

interface IControlledInputProps<T extends FieldValues> extends IInputProps {
  name: Path<T>;
  control: Control<T>;
}

export const ControlledInput = <T extends FieldValues>({
  name,
  control,
  ...props
}: IControlledInputProps<T>) => (
  <Controller
    control={control}
    name={name}
    render={({ field, fieldState: { error } }) => (
      <Input {...field} {...props} status={error ? "error" : "info"} message={error?.message} />
    )}
  />
);
