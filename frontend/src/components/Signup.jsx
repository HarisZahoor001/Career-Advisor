import React from "react";
import Form from "./Form";

export default function Signup({ className }) {
  return (
      <Form route="/users/" method="signup" />
  );
}
