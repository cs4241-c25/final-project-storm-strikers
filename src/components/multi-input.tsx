"use client";

import { cn } from "@/lib/utils";
import { ChevronsUpDown, Plus, Trash } from "lucide-react";
import {
  InputHTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "./ui/button";
import { Command, CommandEmpty, CommandItem, CommandList } from "./ui/command";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

type InputType = InputHTMLAttributes<HTMLInputElement>["value"];

export default function MultiInput(
  props: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "defaultValue" | "ref"
  > & {
    minCount?: number;
    maxCount?: number;
    defaultValue?: InputType[];
  },
) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [values, setValues] = useState<InputType[]>(props.defaultValue ?? []);
  const inputRef = useRef<HTMLInputElement | null>(null);
  // callback to add the value in the input to the list, if it is not empty
  const addValue = useCallback(() => {
    if (values.length < (props.maxLength ?? Number.MAX_SAFE_INTEGER)) {
      inputRef.current?.setCustomValidity(""); // Clear custom validation, we will add it back

      // Ensure the field isn't empty
      if (inputRef.current?.checkValidity() && inputText === "") {
        inputRef.current?.setCustomValidity("Fill out this field");
      }

      // Display validation, if needed
      const validToAdd = inputRef.current?.reportValidity();

      // If we can't add, don't
      if (!validToAdd) {
        return;
      }

      // Add the value, this will re-trigger validation
      setValues([...values, inputText]);
      setPopoverOpen(true); // This happens on tab->enter
    }
  }, [inputText, props.maxLength, values, inputRef]);
  const valid = useMemo(
    () =>
      !(
        (props.required && values.length < (props.minLength ?? 0)) ||
        (!props.required &&
          values.length > 0 &&
          values.length < (props.minLength ?? 0))
      ),
    [props.minLength, props.required, values.length],
  );
  const updateValidity = useCallback(() => {
    if (valid) {
      inputRef.current?.setCustomValidity("");
    } else {
      inputRef.current?.setCustomValidity(
        `Provide at least ${props.minLength ?? 1} elements`,
      );
    }
  }, [props.minLength, valid]);
  useEffect(updateValidity, [props.minLength, valid, updateValidity]);

  return (
    <div className="flex flex-row gap-1">
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <Input
              {...props}
              name={undefined}
              defaultValue={undefined}
              value={inputText}
              ref={inputRef}
              required={false}
              onChange={(changeEvent) => setInputText(changeEvent.target.value)}
              onBlur={(blurEvent) => {
                updateValidity(); /*Ensure we don't have a lingering enter a value*/
                props.onBlur?.(blurEvent);
              }}
              onKeyDown={(keyDownEvent) => {
                if (keyDownEvent.key === "Enter") {
                  addValue();
                  keyDownEvent.preventDefault();
                }
                props.onKeyDown?.(keyDownEvent);
              }}
              className={`${props.className} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
            />
            <ChevronsUpDown className="opacity-50 absolute top-1/2 -translate-y-1/2 h-1/2 right-2" />
          </div>
        </PopoverTrigger>
        <PopoverContent
          onOpenAutoFocus={(focusEvent) => focusEvent.preventDefault()}
          className="p-0"
        >
          <Command>
            <CommandList>
              <CommandEmpty>
                Add by typing in the box and pressing the + or &quot;Enter&quot;
              </CommandEmpty>
              {values.map((value, index) => (
                <CommandItem
                  // ensure values are unique
                  key={index + "_" + value}
                  value={index + "_" + value?.toString()}
                  onSelect={() =>
                    setValues(
                      values.filter((_, filterIndex) => filterIndex !== index),
                    )
                  }
                >
                  {value}
                  <Trash className={cn("ml-auto", "text-destructive")} />
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Button
        variant="outline"
        type="button"
        onPointerDown={(clickEvent) => {
          // use pointer down to prevent changing popover state
          clickEvent.preventDefault();
          clickEvent.stopPropagation();
          addValue();
        }}
      >
        <Plus />
      </Button>
      {values.map((value, index) => (
        <Input
          name={props.name}
          value={value}
          readOnly
          className="hidden"
          key={index + "_" + value}
        />
      ))}
    </div>
  );
}
