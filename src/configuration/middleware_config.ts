import dotenv from "dotenv";
dotenv.config();

export const Validator = {
    common_regex: /^[a-zA-Z0-9 \u00C0-\u00ff\u4e00-\u9fff().,@/=*#&!?%:;"'’_\n\r\-+]+$/,
    common_regex_error_message: `Allowed special characters are - ().,@/=*#&!?%:;"'’_-+. Please ensure, the entered text doesn't contain any special characters outside this list.`,
    password_regex: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>~`\[\]\\\/_\-+=;'’]).*$/,  // ONE UPPERCASE LETTER, ONE LOWERCASE LETTER, ONE DIGIT, AND ONE SPECIAL CHARACTER (!@#$%^&*(),.?":{}|<>~`[]\/_-+=;'’)
    phone_regex: /^[0-9-+\s()]+$/,
    max_phone_length: 20
}