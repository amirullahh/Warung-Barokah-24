"use client";

type MoneyInputProps = {
  id: string;
  value: number | "";
  onChange: (value: number | "") => void;
  placeholder?: string;
};

export function MoneyInput({ id, value, onChange, placeholder }: MoneyInputProps) {
  const tampil = value === "" ? "" : new Intl.NumberFormat("id-ID").format(value);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digitSaja = e.target.value.replace(/\D/g, "");
    onChange(digitSaja === "" ? "" : Number(digitSaja));
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      value={tampil}
      onChange={handleChange}
      placeholder={placeholder}
      className="h-11 w-full rounded-lg border border-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
    />
  );
}
