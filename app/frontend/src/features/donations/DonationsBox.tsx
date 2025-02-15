import {
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  makeStyles,
  Radio,
  RadioGroup,
  Typography,
} from "@material-ui/core";
import classNames from "classnames";
import Alert from "components/Alert";
import Button from "components/Button";
import {
  DONATIONSBOX_ALERT_SUCCESS,
  DONATIONSBOX_ALERT_WARNING,
  DONATIONSBOX_CURRENCY,
  DONATIONSBOX_MONTHLY,
  DONATIONSBOX_NEXT,
  DONATIONSBOX_ONETIME,
  DONATIONSBOX_RECURRING,
  DONATIONSBOX_RECURRING_ARIA,
  DONATIONSBOX_REQUIRED,
  DONATIONSBOX_TEXT,
  DONATIONSBOX_TITLE,
  DONATIONSBOX_VALUES,
} from "features/donations/constants";
import { Error as GrpcError } from "grpc-web";
import { useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { useLocation } from "react-router-dom";
import { service } from "service";

const useStyles = makeStyles((theme) => ({
  donationsBox: {
    padding: theme.spacing(2),
    border: `2px solid ${theme.palette.grey[200]}`,
    borderRadius: theme.shape.borderRadius * 2,
  },

  donationsBoxRow: {
    gridTemplateColumns: "repeat( auto-fit, minmax(160px, 1fr) )",
    gridAutoRows: "2.75rem",
    display: "grid",
    gridGap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },

  donationsBoxSubRow: {
    gridTemplateColumns: "repeat( auto-fit, minmax(72px, 1fr) )",
    display: "grid",
    gridGap: theme.spacing(2),
  },

  buttonSecondary: {
    "&&": {
      boxShadow: "initial",
      color: theme.palette.grey[600],
      cursor: "pointer",
      fontWeight: 700,
      fontSize: theme.typography.button.fontSize,
      transition: `color ${theme.transitions.duration.short}ms ${theme.transitions.easing.easeInOut}`,
      justifyContent: "center",
      alignItems: "center",
      border: `2px solid ${theme.palette.grey[200]}`,
      borderRadius: "0.5rem",
      backgroundColor: theme.palette.grey[200],
      margin: "initial",
      height: "100%",
      width: "100%",
      display: "flex",
    },

    "&:hover": {
      border: `2px solid ${theme.palette.primary.main}`,
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.primary.main,
      transition: `color ${theme.transitions.duration.short}ms ${theme.transitions.easing.easeInOut}`,
    },
  },

  buttonSecondaryRadio: {
    "&&": {
      boxShadow: "initial",
      margin: 0,
    },
    "&:hover > .MuiFormControlLabel-label": {
      border: `2px solid ${theme.palette.primary.main}`,
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.primary.main,
      transition: `color ${theme.transitions.duration.short}ms ${theme.transitions.easing.easeInOut}`,
    },
    "& > .MuiRadio-root": {
      position: "absolute",
      left: "-10000px",
    },
    "& > .MuiFormControlLabel-label": {
      color: theme.palette.grey[600],
      fontWeight: 700,
      fontSize: theme.typography.button.fontSize,
      transition: `color ${theme.transitions.duration.short}ms ${theme.transitions.easing.easeInOut}`,
      justifyContent: "center",
      alignItems: "center",
      border: `2px solid ${theme.palette.grey[200]}`,
      borderRadius: "0.5rem",
      backgroundColor: theme.palette.grey[200],
      margin: "initial",
      height: "100%",
      width: "100%",
      display: "flex",
    },
    "& > .Mui-checked ~.MuiFormControlLabel-label": {
      border: `2px solid ${theme.palette.primary.main}`,
      backgroundColor: theme.palette.background.paper,
    },
  },

  buttonSecondaryActive: {
    "&&": {
      border: `2px solid ${theme.palette.primary.main}`,
      backgroundColor: theme.palette.background.paper,
    },
  },

  buttonMain: {
    backgroundColor: theme.palette.primary.main,
    "&&": {
      borderRadius: "0.5rem",
      boxShadow: "initial",
    },
    "&:hover": {
      opacity: 0.4,
      backgroundColor: theme.palette.primary.main,
    },
    "& .MuiButton-label": {
      color: theme.palette.background.paper,
      transition: `color ${theme.transitions.duration.short}ms ${theme.transitions.easing.easeInOut}`,
    },
  },

  buttonMainText: {
    color: theme.palette.background.paper,
    fontWeight: 700,
    transition: `color ${theme.transitions.duration.short}ms ${theme.transitions.easing.easeInOut}`,
  },

  formGroup: {
    width: "100%",
  },

  marginY2: {
    margin: theme.spacing(2, 0),
  },

  marginBottom2: {
    marginBottom: theme.spacing(2),
  },

  inputWrapper: {
    position: "relative",
    "&::before": {
      content: `'${DONATIONSBOX_CURRENCY}'`,
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      left: theme.spacing(1),
      color: theme.palette.grey[600],
      fontWeight: 700,
      fontSize: theme.typography.button.fontSize,
    },
  },

  inputNumber: {
    width: "100%",
    height: "100%",
    border: `2px solid ${theme.palette.grey[200]}`,
    paddingLeft: theme.spacing(2),
    color: theme.palette.grey[600],
    fontWeight: 700,
    fontSize: theme.typography.button.fontSize,
    "&&": {
      borderRadius: theme.shape.borderRadius * 2,
      boxShadow: "initial",
    },
    "&:hover": {
      border: `2px solid ${theme.palette.primary.main}`,
    },
    "&:focus-visible": {
      border: `2px solid ${theme.palette.primary.main}`,
      outline: "none",
      boxShadow: "none",
    },
  },

  inputNumberActive: {
    "&&": {
      border: `2px solid ${theme.palette.primary.main}`,
    },
  },
}));

export interface DonationFormData {
  amount: number;
  recurring: "monthly" | "one-off";
}

export default function DonationsBoxMixed() {
  const stripePromise = useMemo(async () => {
    const stripe = await import("@stripe/stripe-js");
    return stripe.loadStripe(process.env.REACT_APP_STRIPE_KEY);
  }, []);

  const classes = useStyles();

  const [isPredefinedAmount, setisPredefinedAmount] = useState(true);

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const [success] = useState(query.get("success") ? true : false);
  const [cancelled] = useState(query.get("cancelled") ? true : false);

  const {
    control,
    handleSubmit,
    reset: resetForm,
    errors,
  } = useForm<DonationFormData>();

  const customAmountInput = useRef<HTMLInputElement>(null);

  const {
    error,
    isLoading,
    mutate: initiateDonation,
  } = useMutation<void, GrpcError, DonationFormData>(
    async ({ amount, recurring }) => {
      const stripe = (await stripePromise)!;
      const session_id = await service.donations.initiateDonation(
        amount,
        recurring === "monthly"
      );
      // When the customer clicks on the button, redirect them to Checkout.
      const result = await stripe.redirectToCheckout({
        sessionId: session_id,
      });
      if (result.error) {
        throw Error(result.error.message);
      }
    },
    {
      onSuccess: () => {
        resetForm();
      },
    }
  );

  const onSubmit = handleSubmit((data) => {
    initiateDonation(data);
  });

  return (
    <>
      <form onSubmit={onSubmit} className={classes.donationsBox}>
        {error && <Alert severity="error">{error.message}</Alert>}
        {success && (
          <Alert severity="success">{DONATIONSBOX_ALERT_SUCCESS}</Alert>
        )}
        {cancelled && (
          <Alert severity="warning">{DONATIONSBOX_ALERT_WARNING}</Alert>
        )}
        <Typography className={classes.marginBottom2} variant="h3">
          {DONATIONSBOX_TITLE}
        </Typography>
        <Controller
          id="recurring"
          control={control}
          name="recurring"
          rules={{
            required: DONATIONSBOX_REQUIRED,
          }}
          defaultValue="monthly"
          render={({ onChange, value }) => (
            <FormControl className={classes.formGroup}>
              <RadioGroup
                className={classes.donationsBoxRow}
                aria-label={DONATIONSBOX_RECURRING_ARIA}
                name="recurring-radio"
                onChange={(e, value) => onChange(value)}
                value={value}
              >
                <FormControlLabel
                  className={classes.buttonSecondaryRadio}
                  value="monthly"
                  control={<Radio />}
                  label={DONATIONSBOX_MONTHLY}
                />
                <FormControlLabel
                  className={classes.buttonSecondaryRadio}
                  value="one-time"
                  control={<Radio />}
                  label={DONATIONSBOX_ONETIME}
                />
              </RadioGroup>
              <FormHelperText error={!!errors?.recurring?.message}>
                {errors?.recurring?.message}
              </FormHelperText>
            </FormControl>
          )}
        />
        <Typography variant="body2">{DONATIONSBOX_RECURRING}</Typography>

        <Divider className={classes.marginY2} />

        <Controller
          name="amount"
          control={control}
          defaultValue={DONATIONSBOX_VALUES[2].amount}
          render={({ onChange, value }) => (
            <div className={classes.donationsBoxRow}>
              <div className={classes.donationsBoxSubRow}>
                <button
                  type="button"
                  onClick={() => {
                    if (customAmountInput.current)
                      customAmountInput.current.value = "";
                    onChange(DONATIONSBOX_VALUES[0].amount);
                    setisPredefinedAmount(true);
                  }}
                  className={classNames(classes.buttonSecondary, {
                    [classes.buttonSecondaryActive]:
                      value === DONATIONSBOX_VALUES[0].amount &&
                      isPredefinedAmount,
                  })}
                >
                  {DONATIONSBOX_VALUES[0].currency}
                  {DONATIONSBOX_VALUES[0].amount}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (customAmountInput.current)
                      customAmountInput.current.value = "";
                    onChange(DONATIONSBOX_VALUES[1].amount);
                    setisPredefinedAmount(true);
                  }}
                  className={classNames(classes.buttonSecondary, {
                    [classes.buttonSecondaryActive]:
                      value === DONATIONSBOX_VALUES[1].amount &&
                      isPredefinedAmount,
                  })}
                >
                  {DONATIONSBOX_VALUES[1].currency}
                  {DONATIONSBOX_VALUES[1].amount}
                </button>
              </div>

              <div className={classes.donationsBoxSubRow}>
                <button
                  type="button"
                  onClick={() => {
                    if (customAmountInput.current)
                      customAmountInput.current.value = "";
                    onChange(DONATIONSBOX_VALUES[2].amount);
                    setisPredefinedAmount(true);
                  }}
                  className={classNames(classes.buttonSecondary, {
                    [classes.buttonSecondaryActive]:
                      value === DONATIONSBOX_VALUES[2].amount &&
                      isPredefinedAmount,
                  })}
                >
                  {DONATIONSBOX_VALUES[2].currency}
                  {DONATIONSBOX_VALUES[2].amount}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (customAmountInput.current)
                      customAmountInput.current.value = "";
                    onChange(DONATIONSBOX_VALUES[3].amount);
                    setisPredefinedAmount(true);
                  }}
                  className={classNames(classes.buttonSecondary, {
                    [classes.buttonSecondaryActive]:
                      value === DONATIONSBOX_VALUES[3].amount &&
                      isPredefinedAmount,
                  })}
                >
                  {DONATIONSBOX_VALUES[3].currency}
                  {DONATIONSBOX_VALUES[3].amount}
                </button>
              </div>

              <div className={classes.donationsBoxSubRow}>
                <button
                  type="button"
                  onClick={() => {
                    if (customAmountInput.current)
                      customAmountInput.current.value = "";
                    onChange(DONATIONSBOX_VALUES[4].amount);
                    setisPredefinedAmount(true);
                  }}
                  className={classNames(classes.buttonSecondary, {
                    [classes.buttonSecondaryActive]:
                      value === DONATIONSBOX_VALUES[4].amount &&
                      isPredefinedAmount,
                  })}
                >
                  {DONATIONSBOX_VALUES[4].currency}
                  {DONATIONSBOX_VALUES[4].amount}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (customAmountInput.current)
                      customAmountInput.current.value = "";
                    onChange(DONATIONSBOX_VALUES[5].amount);
                    setisPredefinedAmount(true);
                  }}
                  className={classNames(classes.buttonSecondary, {
                    [classes.buttonSecondaryActive]:
                      value === DONATIONSBOX_VALUES[5].amount &&
                      isPredefinedAmount,
                  })}
                >
                  {DONATIONSBOX_VALUES[5].currency}
                  {DONATIONSBOX_VALUES[5].amount}
                </button>
              </div>

              <div className={classes.donationsBoxRow}>
                <div className={classes.donationsBoxSubRow}>
                  <button
                    type="button"
                    onClick={() => {
                      if (customAmountInput.current)
                        customAmountInput.current.value = "";
                      onChange(DONATIONSBOX_VALUES[6].amount);
                      setisPredefinedAmount(true);
                    }}
                    className={classNames(classes.buttonSecondary, {
                      [classes.buttonSecondaryActive]:
                        value === DONATIONSBOX_VALUES[6].amount &&
                        isPredefinedAmount,
                    })}
                  >
                    {DONATIONSBOX_VALUES[6].currency}
                    {DONATIONSBOX_VALUES[6].amount}
                  </button>
                  <div className={classes.inputWrapper}>
                    <input
                      ref={customAmountInput}
                      type="number"
                      onChange={(e) => {
                        onChange(
                          typeof e.target.valueAsNumber === "number"
                            ? e.target.valueAsNumber
                            : DONATIONSBOX_VALUES[0].amount
                        );
                        setisPredefinedAmount(false);
                      }}
                      className={classNames(classes.inputNumber, {
                        [classes.inputNumberActive]: !isPredefinedAmount,
                      })}
                      id="amount"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        />

        <Typography variant="body2" paragraph>
          {DONATIONSBOX_TEXT}
        </Typography>

        <div className={classes.donationsBoxRow}>
          <Button
            type="submit"
            loading={isLoading}
            onClick={onSubmit}
            classes={{
              root: classes.buttonMain,
              label: classes.buttonMainText,
            }}
          >
            {DONATIONSBOX_NEXT}
          </Button>
        </div>
      </form>
    </>
  );
}
