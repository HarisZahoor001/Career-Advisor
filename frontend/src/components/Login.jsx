import React from "react";
import Form from "./Form";

export default function Login({ className }) {
  return (
    <Form route="/api/token/" method="login" />
  );
}
