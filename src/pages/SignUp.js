import React, { useEffect, useState } from "react";
//validations forimport { useForm } from 'react-hook-form'
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";

import Input from "src/components/Input";
import Button from "src/components/Button";
import axios from "axios";
import LOGO from "../../src/images/logo-ximi.png";

//sing up via phone number
import firebase from "src/utils/firebase_config";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
const auth = getAuth(firebase);

const formSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Your last name is required"),
  mobile: Yup.number().required("Phone number is required"),
  otp: Yup.string().required("OTP is required"),
  email: Yup.string().email().required("Email is required"),
  password: Yup.string()
    .required("Password is mendatory")
    .min(7, "Password must be at 7 char long"),
  confirmPassword: Yup.string()
    .required("Password is mendatory")
    .oneOf([Yup.ref("password")], "Passwords does not match"),
});

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verifyButton, setVerifyButton] = useState(false);
  const [verifyOtpButton, setVerifyOtpButton] = useState(false);
  const [otp, setOtp] = useState(false);
  const [showVerified, setShowVerified] = useState(false);

  const formOptions = { resolver: yupResolver(formSchema) };
  const { register, handleSubmit, reset, formState } = useForm(formOptions);
  const { errors } = formState;
  function onSubmit() {
    if (showVerified) {
      const addUser = {
        firstName: firstName,
        lastName: lastName,
        mobile: mobile,
        email: email,
        password: password,
      };

      axios
        .post("http://localhost:5000/register", addUser, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        })
        .then(function (response) {
          if (response.data.status === "OK") {
            toast.success("User has been registered");
          } else {
            toast.error(response.data.error);
          }
          const interval = setInterval(() => {
            // window.location.href = "./sign-in";
          }, 2000);
          return () => clearInterval(interval);
          // console.log(response.data);
        })
        .catch(function (error) {
          toast.error(error);
        });
    } else {
      toast.error("Please Verify Phone Number");
    }
    // console.log(addUser);
  }

  //Set up the reCAPTCHA verifier
  const onCaptchaVerify = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            onSendOTP();
            // reCAPTCHA solved, allow signInWithPhoneNumber.
          },
        },
        auth
      );
    }
  };

  useEffect(() => {
    if (mobile.length >= 8 && mobile.length <= 10) {
      setVerifyButton(true);
    } else {
      setVerifyButton(false);
    }
  }, [mobile]);

  const ChangeMobile = (e) => {
    setMobile(e.target.value);
  };

  //Send a verification code to the user's phone
  const onSendOTP = () => {
    onCaptchaVerify();
    const phoneNumber = "+381" + mobile;
    // console.log(phoneNumber);
    const appVerifier = window.recaptchaVerifier;
    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      .then((confirmationResult) => {
        // SMS sent. Prompt user to type the code from the message, then sign the
        // user in with confirmationResult.confirm(code).
        window.confirmationResult = confirmationResult;
        toast.info("OTP sended");
        setVerifyOtpButton(true);
      })
      .catch((error) => {
        if (error) {
          toast.error("Error; SMS not sent. You have tried to many times");
        }
      });
  };

  //Sign in the user with the verification code
  const VerifyCode = () => {
    window.confirmationResult
      .confirm(otp)
      .then((result) => {
        // User signed in successfully.
        // const user = result.user;
        // console.log(user);
        toast.success("Verification done");

        setShowVerified(true);
        setVerifyOtpButton(false);
        // ...
      })
      .catch((error) => {
        toast.error("User couldn't verify phone number (bad verification code?)");
      });
  };

  // const handleSubmit = (e) => {};

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center space-y-8">
      <img src={LOGO} alt="logo auto ximi" className=" h-auto w-64" />
      <h3 className="text-2xl font-bold text-primary">Register User</h3>
      {/* <form className="w-96" autoComplete="off" onSubmit={handleSubmit}> */}
      <form className="w-96" autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <div id="recaptcha-container"></div>
        <Input
          type="text"
          name="firstName"
          id="firstName"
          value={firstName}
          label="Your First Name"
          onChange={(e) => setFirstName(e.target.value)}
          register={{ ...register("firstName") }}
          error={errors.firstName}
        />
        <Input
          type="text"
          name="lastName"
          id="lastName"
          value={lastName}
          label="Your Last Name"
          onChange={(e) => setLastName(e.target.value)}
          register={{ ...register("lastName") }}
          error={errors.lastName}
        />
        {/* Phone Number */}
        <Input
          type="number"
          name="mobile"
          id="mobile"
          label="Your Phone Number"
          value={mobile}
          onChange={(e) => ChangeMobile(e)}
          showHelperText={true}
          // register={{ ...register("mobile") }}
          // error={errors.mobile}
        />

        {verifyButton === true && (
          <Button
            extraClass={`${
              showVerified
                ? "!bg-green-500 cursor-no-drop hover:!bg-green-300 !border-transparent"
                : ""
            } w-full !p-1 mb-8 hover:!bg-gray-300 hover:border-transparent hover:text-black`}
            onClick={() => onSendOTP()}
            btnType="button"
            disabled={showVerified ? true : false}
            btnName={`${showVerified ? "Verified" : "Send OTP"}`}
          />
        )}
        {/* END OF PHONE NUMBER  */}
        {/* OTP  */}
        {verifyOtpButton === true && (
          <>
            <Input
              type="number"
              label="Your OTP"
              name="otp"
              id="otp"
              onChange={(e) => setOtp(e.target.value)}
              register={{ ...register("otp") }}
              error={errors.otp}
            />

            <Button
              extraClass={`w-full !p-1 mb-8 hover:!bg-gray-300 hover:border-transparent hover:text-black`}
              onClick={() => VerifyCode()}
              btnType="button"
              btnName="Verify OTP"
            />
          </>
        )}
        {/* END OF OTP  */}
        <Input
          type="email"
          name="email"
          id="email"
          value={email}
          label="Your Email"
          onChange={(e) => setEmail(e.target.value)}
          register={{ ...register("email") }}
          error={errors.email}
        />
        <Input
          type="password"
          name="password"
          id="password"
          value={password}
          label="Your Password"
          onChange={(e) => setPassword(e.target.value)}
          register={{ ...register("password") }}
          error={errors.password}
        />
        <Input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          value={confirmPassword}
          label="Confirm Password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          register={{ ...register("confirmPassword") }}
          error={errors.confirmPassword}
        />
        <Button btnType="submit" btnName="Sign Up" />
        <p className="forgot-password text-right">
          Already registered{" "}
          <a className="font-medium text-primary hover:text-gray-500" href="/sign-in">
            sign in?
          </a>
        </p>
      </form>
    </div>
  );
}
