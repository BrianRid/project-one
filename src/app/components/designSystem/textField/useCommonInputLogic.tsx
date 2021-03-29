

import { useState, useEffect } from "react";
import { useConstCallback } from "powerhooks";
import { id } from "evt/tools/typeSafety/id";
import type { Optional } from "evt/tools/typeSafety";
import { noUndefined } from "app/tools/noUndefined";
import type { NonPostableEvt } from "evt";
import { useEvt } from "evt/hooks";
import { useEffectOnValueChange } from "powerhooks";
import type { ReturnType } from "evt/tools/typeSafety";

export type Props = {
    className?: string | null;
    tabIndex?: number | null;
    id?: string | null;
    name?: string | null;
    autoComplete?: "on" | "off";
    type?: "text" | "password";
    /** Will overwrite value when updated */
    defaultValue: string;
    inputProps: { 'aria-label': string; };
    autoFocus?: boolean;
    color?: "primary" | "secondary" | null;
    disabled?: boolean;
    multiline?: boolean;
    onEscapeKeyDown?: () => void;
    onEnterKeyDown?: () => void;
    onBlur?(): void;
    evtAction?: NonPostableEvt<"TRIGGER SUBMIT" | "RESTORE DEFAULT VALUE"> | null;
    onSubmit?(params: { value: string; isValidValue: boolean; }): void;
    getIsValidValue?(value: string): { isValidValue: true } | { isValidValue: false; message: string; };
    /** Invoked on first render */
    onValueBeingTypedChange?(params: { value: string; } & ReturnType<Props["getIsValidValue"]>): void;
    transformValueBeingTyped?: (value: string) => string;
};

export const defaultProps: Optional<Props> = {
    "className": null,
    "tabIndex": null,
    "id": null,
    "name": null,
    "autoComplete": "off",
    "type": "text",
    "autoFocus": false,
    "color": null,
    "disabled": false,
    "multiline": false,
    "onEscapeKeyDown": () => { },
    "onEnterKeyDown": () => { },
    "onBlur": () => { },
    "onSubmit": ()=> {},
    "getIsValidValue": ()=> ({ "isValidValue": true }),
    "evtAction": null,
    "onValueBeingTypedChange": () => { },
    "transformValueBeingTyped": id,
};

export function useCommonInputLogic(props: Props) {

    const completedProps = { ...defaultProps, ...noUndefined(props) };

    const {
        className,
        tabIndex,
        id,
        name,
        autoComplete,
        type,
        defaultValue,
        inputProps,
        autoFocus,
        color,
        disabled,
        multiline,
        onEscapeKeyDown,
        onEnterKeyDown,
        onBlur,
        evtAction,
        onSubmit,
        getIsValidValue,
        onValueBeingTypedChange,
        transformValueBeingTyped
    } = completedProps;

    const { value, transformAndSetValue } = (function useClosure(
        transformValueBeingTyped: NonNullable<Props["transformValueBeingTyped"]>
    ) {

        const [value, setValue] = useState(defaultValue);

        const transformAndSetValue = useConstCallback(
            (value: string) => setValue(
                transformValueBeingTyped(value)
            )
        );

        return { value, transformAndSetValue };

    })(transformValueBeingTyped);

    useEffectOnValueChange(
        () => transformAndSetValue(defaultValue),
        [defaultValue]
    );

    const [isValidValue, setIsValidValue] = useState(
        () => getIsValidValue(value).isValidValue
    );

    useEffect(
        () => {
            const getIsValidValueResult = getIsValidValue(value);
            setIsValidValue(getIsValidValueResult.isValidValue);
            onValueBeingTypedChange({ value, ...getIsValidValueResult });
        },
        [value, getIsValidValue, onValueBeingTypedChange]
    );

    useEvt(
        ctx => evtAction?.attach(
            ctx,
            action => {
                switch (action) {
                    case "RESTORE DEFAULT VALUE":
                        transformAndSetValue(defaultValue);
                        return;
                    case "TRIGGER SUBMIT":
                        onSubmit({ value, isValidValue });
                        return;
                }
            }
        ),
        [defaultValue, value, isValidValue, onSubmit, evtAction, transformAndSetValue]
    );


    const onChange = useConstCallback(
        ({ target }: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            transformAndSetValue(target.value)
    );

    const onFocus = useConstCallback(
        ({ target }: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            target.setSelectionRange(0, target.value.length)
    );

    const onKeyDown = useConstCallback(
        (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLDivElement>) => {

            const key = (() => {
                switch (event.key) {
                    case "Escape":
                    case "Enter":
                        return event.key;
                    default: return "irrelevant";
                }
            })();

            if (key === "irrelevant") {
                return;
            }

            event.preventDefault();

            switch (key) {
                case "Escape": onEscapeKeyDown(); return;
                case "Enter": onEnterKeyDown(); return;
            }

        }
    );

    return {
        "className": className ?? undefined,
        "tabIndex": tabIndex ?? undefined,
        "id": id ?? undefined,
        "name": name ?? undefined,
        autoComplete,
        type,
        inputProps,
        autoFocus,
        "color": color ?? undefined,
        disabled,
        multiline,
        "error": !isValidValue,
        onChange,
        onFocus,
        onKeyDown,
        onBlur,
        value
    };


}
