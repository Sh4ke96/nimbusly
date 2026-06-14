import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AUTH_FORM_FIELD } from "@/lib/auth/form";
import { executeSignIn } from "@/lib/auth/server/sign-in";
import { executeSignUp } from "@/lib/auth/server/sign-up";
import { dict } from "@/lib/i18n";

describe("executeSignIn", () => {
  it("requires email and password", async () => {
    const result = await executeSignIn(
      {
        t: dict.pl,
        supabase: {} as never,
        getPostAuthRedirectPath: async () => "/dashboard",
      },
      new FormData()
    );
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error, dict.pl.login.errorRequired);
  });

  it("maps invalid credentials", async () => {
    const formData = new FormData();
    formData.set(AUTH_FORM_FIELD.EMAIL, "user@test.com");
    formData.set(AUTH_FORM_FIELD.PASSWORD, "wrong");

    const result = await executeSignIn(
      {
        t: dict.pl,
        supabase: {
          auth: {
            signInWithPassword: async () => ({
              error: { message: "Invalid login credentials" },
            }),
            getUser: async () => ({ data: { user: null } }),
          },
        } as never,
        getPostAuthRedirectPath: async () => "/dashboard",
      },
      formData
    );
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error, dict.pl.login.errorInvalid);
  });

  it("returns redirect path for authenticated user", async () => {
    const formData = new FormData();
    formData.set(AUTH_FORM_FIELD.EMAIL, "user@test.com");
    formData.set(AUTH_FORM_FIELD.PASSWORD, "secret123");

    const result = await executeSignIn(
      {
        t: dict.pl,
        supabase: {
          auth: {
            signInWithPassword: async () => ({ error: null }),
            getUser: async () => ({ data: { user: { id: "user-1" } } }),
          },
        } as never,
        getPostAuthRedirectPath: async () => "/dashboard",
      },
      formData
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.redirectTo, "/dashboard");
  });
});

describe("executeSignUp", () => {
  it("validates password length", async () => {
    const formData = new FormData();
    formData.set(AUTH_FORM_FIELD.EMAIL, "new@test.com");
    formData.set(AUTH_FORM_FIELD.PASSWORD, "short");
    formData.set(AUTH_FORM_FIELD.CONFIRM_PASSWORD, "short");

    const result = await executeSignUp(
      { t: dict.pl, supabase: {} as never },
      formData
    );
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error, dict.pl.register.errorPasswordLength);
  });

  it("validates matching passwords", async () => {
    const formData = new FormData();
    formData.set(AUTH_FORM_FIELD.EMAIL, "new@test.com");
    formData.set(AUTH_FORM_FIELD.PASSWORD, "password123");
    formData.set(AUTH_FORM_FIELD.CONFIRM_PASSWORD, "different");

    const result = await executeSignUp(
      { t: dict.pl, supabase: {} as never },
      formData
    );
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error, dict.pl.register.errorPasswordMatch);
  });

  it("returns success after sign up", async () => {
    const formData = new FormData();
    formData.set(AUTH_FORM_FIELD.EMAIL, "new@test.com");
    formData.set(AUTH_FORM_FIELD.PASSWORD, "password123");
    formData.set(AUTH_FORM_FIELD.CONFIRM_PASSWORD, "password123");

    const result = await executeSignUp(
      {
        t: dict.pl,
        supabase: {
          auth: {
            signUp: async () => ({ error: null }),
          },
        } as never,
      },
      formData
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.success, dict.pl.register.successMessage);
    assert.equal(result.inviteCode, null);
  });
});
