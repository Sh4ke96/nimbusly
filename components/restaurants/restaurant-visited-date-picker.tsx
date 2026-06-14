"use client";

import { RESTAURANT_FORM_FIELD } from "@/lib/restaurants/types";
import { useT } from "@/lib/lang-context";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { dateToRestaurantDateString } from "@/lib/restaurants/types";

interface RestaurantVisitedDatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  required?: boolean;
}

export function RestaurantVisitedDatePicker({
  date,
  onDateChange,
  required = false,
}: RestaurantVisitedDatePickerProps) {
  const t = useT();

  return (
    <DatePickerField
      label={t.restaurants.visitedAtLabel}
      hint={t.restaurants.visitedAtHint}
      placeholder={t.restaurants.pickVisitedDate}
      date={date}
      onDateChange={onDateChange}
      disabled={(day) => day > new Date()}
      hiddenInputs={
        <input
          type="hidden"
          name={RESTAURANT_FORM_FIELD.VISITED_AT}
          value={date ? dateToRestaurantDateString(date) : ""}
          required={required}
        />
      }
    />
  );
}
