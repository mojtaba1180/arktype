import React from "react"
import { Theme } from "@material-ui/core"
import { makeStyles } from "@material-ui/styles"
import { BaseTextFieldProps } from "@material-ui/core/TextField"
import { TextInputVariants } from "./TextInputVariants"

const stylize = makeStyles((theme: Theme) => ({
    inputLabel: {
        color: theme.palette.primary.light,
        "&$focused": {
            color: theme.palette.primary.dark
        }
    }
}))

// for unknown reason, taking intersection of this type narrows
// the variant prop to be the default value only, so omitting variant is required.
export type BaseTextFieldVariantProps = Omit<BaseTextFieldProps, "variant">

export type TextInputProps = BaseTextFieldVariantProps & {
    icon?: JSX.Element
    label?: string
    variant?: "outlined" | "underlined"
}
export const TextInput = ({
    icon,
    label,
    variant = "outlined",
    ...rest
}: TextInputProps) => {
    const Component = TextInputVariants[variant]
    const { inputLabel } = stylize()
    return (
        <Component
            label={label}
            margin="dense"
            fullWidth
            InputLabelProps={{
                classes: { root: inputLabel }
            }}
            {...rest}
        />
    )
}