"use strict";

/* ------------------------------------------------------------------
   Pure validation helpers (no document / window access).
   ------------------------------------------------------------------ */

var STUDENT_NUMBER_PATTERN = /^\d{2}-\d{4}-\d{3}$/;
var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var MOBILE_PATTERN = /^(09|\+639)\d{9}$/;
var PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!])\S{8,}$/;

function isValidStudentNumber(value) {
  if (typeof value !== "string") {
    return false;
  }
  return STUDENT_NUMBER_PATTERN.test(value.trim());
}

function isValidPassword(value) {
  if (typeof value !== "string") {
    return false;
  }
  return PASSWORD_PATTERN.test(value);
}

function isValidEmail(value) {
  return typeof value === "string" && EMAIL_PATTERN.test(value.trim());
}

function isValidMobileNumber(value) {
  return typeof value === "string" && MOBILE_PATTERN.test(value.trim());
}

function isValidFullName(value) {
  return typeof value === "string" && value.trim().length >= 2;
}

/* Returns the list of password rules that are NOT yet met. */
function getPasswordIssues(value) {
  var password = typeof value === "string" ? value : "";
  var issues = [];
  if (password.length < 8) { issues.push("at least 8 characters"); }
  if (!/[A-Z]/.test(password)) { issues.push("one uppercase letter"); }
  if (!/\d/.test(password)) { issues.push("one digit"); }
  if (!/[@$!]/.test(password)) { issues.push("one of @, $, or !"); }
  if (/\s/.test(password)) { issues.push("no spaces"); }
  return issues;
}

/* ------------------------------------------------------------------
   Browser behavior (guarded so the file can be loaded in Node).
   ------------------------------------------------------------------ */

function initRegistrationForm() {
  var form = document.getElementById("registrationForm");
  if (!form) { return; }

  var fields = {
    fullName: document.getElementById("fullName"),
    studentNumber: document.getElementById("studentNumber"),
    email: document.getElementById("email"),
    mobileNumber: document.getElementById("mobileNumber"),
    password: document.getElementById("password"),
    confirmPassword: document.getElementById("confirmPassword"),
    course: document.getElementById("course"),
    terms: document.getElementById("terms")
  };

  var passwordFeedback = document.getElementById("passwordFeedback");
  var successMessage = document.getElementById("successMessage");
  var summary = document.getElementById("registrationSummary");

  var summaryFields = {
    summaryName: document.getElementById("summaryName"),
    summaryStudentNumber: document.getElementById("summaryStudentNumber"),
    summaryEmail: document.getElementById("summaryEmail"),
    summaryMobileNumber: document.getElementById("summaryMobileNumber"),
    summaryCourse: document.getElementById("summaryCourse")
  };

  /* Each validator returns an error message, or "" when the value is valid. */
  var validators = {
    fullName: function () {
      var name = fields.fullName.value.trim();
      if (name.length === 0) { return "Enter your full name."; }
      if (name.length < 2) { return "Full name must be at least 2 characters."; }
      return "";
    },
    studentNumber: function () {
      var value = fields.studentNumber.value.trim();
      if (value.length === 0) { return "Enter your student number."; }
      if (!isValidStudentNumber(value)) {
        return "Enter a student number in the format 24-1234-123.";
      }
      return "";
    },
    email: function () {
      var value = fields.email.value.trim();
      if (value.length === 0) { return "Enter your email address."; }
      if (!isValidEmail(value)) {
        return "Enter an email like name@example.com, with no spaces.";
      }
      return "";
    },
    mobileNumber: function () {
      var value = fields.mobileNumber.value.trim();
      if (value.length === 0) { return "Enter your mobile number."; }
      if (!isValidMobileNumber(value)) {
        return "Enter 09 or +639 followed by nine digits, with no spaces or hyphens.";
      }
      return "";
    },
    password: function () {
      var value = fields.password.value;
      if (value.length === 0) { return "Enter a password."; }
      if (!isValidPassword(value)) {
        return "Password needs: " + getPasswordIssues(value).join(", ") + ".";
      }
      return "";
    },
    confirmPassword: function () {
      var value = fields.confirmPassword.value;
      if (value.length === 0) { return "Confirm your password."; }
      if (value !== fields.password.value) {
        return "Passwords do not match. Re-enter the same password.";
      }
      return "";
    },
    course: function () {
      var value = fields.course.value;
      if (value !== "BSIT" && value !== "BSCS") { return "Select BSIT or BSCS."; }
      return "";
    },
    terms: function () {
      if (!fields.terms.checked) { return "You must agree to the terms to register."; }
      return "";
    }
  };

  var fieldOrder = ["fullName", "studentNumber", "email", "mobileNumber",
                    "password", "confirmPassword", "course", "terms"];

  function showError(name, message) {
    var errorEl = document.getElementById(name + "Error");
    errorEl.textContent = message;
    fields[name].setAttribute("aria-invalid", message ? "true" : "false");
  }

  function validateField(name) {
    var message = validators[name]();
    showError(name, message);
    return message === "";
  }

  function clearSuccess() {
    successMessage.textContent = "";
    successMessage.hidden = true;
    summary.hidden = true;
    Object.keys(summaryFields).forEach(function (id) {
      summaryFields[id].textContent = "";
    });
  }

  function updatePasswordFeedback() {
    var value = fields.password.value;
    var issues = getPasswordIssues(value);
    if (issues.length === 0) {
      passwordFeedback.textContent = "Password meets all requirements.";
      passwordFeedback.className = "feedback ok";
    } else {
      passwordFeedback.textContent = "Still needed: " + issues.join(", ") + ".";
      passwordFeedback.className = "feedback";
    }
  }

  /* Submit */
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearSuccess();

    var firstInvalid = null;
    fieldOrder.forEach(function (name) {
      if (!validateField(name) && !firstInvalid) { firstInvalid = fields[name]; }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    summaryFields.summaryName.textContent = fields.fullName.value.trim();
    summaryFields.summaryStudentNumber.textContent = fields.studentNumber.value.trim();
    summaryFields.summaryEmail.textContent = fields.email.value.trim();
    summaryFields.summaryMobileNumber.textContent = fields.mobileNumber.value.trim();
    summaryFields.summaryCourse.textContent = fields.course.value;

    successMessage.textContent = "Registration details validated successfully!";
    successMessage.hidden = false;
    summary.hidden = false;
    successMessage.focus();
  });

  /* Live password feedback (input event) */
  fields.password.addEventListener("input", function () {
    updatePasswordFeedback();
    if (fields.password.getAttribute("aria-invalid") === "true") { validateField("password"); }
    if (fields.confirmPassword.value.length > 0) { validateField("confirmPassword"); }
  });

  /* Full name on blur */
  fields.fullName.addEventListener("blur", function () {
    validateField("fullName");
  });

  /* Course and terms on change */
  fields.course.addEventListener("change", function () { validateField("course"); });
  fields.terms.addEventListener("change", function () { validateField("terms"); });

  /* Re-check a field as it is corrected, so its error disappears. */
  ["fullName", "studentNumber", "email", "mobileNumber", "confirmPassword"].forEach(function (name) {
    fields[name].addEventListener("input", function () {
      if (fields[name].getAttribute("aria-invalid") === "true") { validateField(name); }
    });
  });

  /* Reset */
  form.addEventListener("reset", function () {
    fieldOrder.forEach(function (name) { showError(name, ""); });
    passwordFeedback.textContent = "";
    passwordFeedback.className = "feedback";
    clearSuccess();
  });

  clearSuccess();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRegistrationForm);
  } else {
    initRegistrationForm();
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    isValidStudentNumber: isValidStudentNumber,
    isValidPassword: isValidPassword
  };
}
