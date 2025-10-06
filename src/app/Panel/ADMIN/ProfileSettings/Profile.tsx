import * as Yup from "yup";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import InputText from "@/components/ui/InputText";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useActionCall, useGetCall } from "@/hooks";
import { SERVICE } from "@/constants/services";
import Loader from "@/components/ui/Loader";
import Lib from "@/utils/Lib";
import { useFormik } from "formik";
import Btn from "@/components/ui/Btn";
import { useEffect, useMemo } from "react";

export const USER_VALIDATION_SCHEMA = Yup.object().shape({
  first_name: Yup.string().required("Required First Name*"),
  last_name: Yup.string().required("Required Last Name*"),
  mobile: Yup.string().required("Required Mobile number*"),
});

export const PASSWORD_VALIDATION_SCHEMA = Yup.object().shape({
  current_password: Yup.string().required("Password is required*"),
  new_password: Yup.string()
    .required("Password is required*")
    .min(8, "Password must be at least 8 characters"),
  password_confirmation: Yup.string()
    .required("Password confirmation is required*")
    .oneOf(
      [Yup.ref("new_password"), null],
      "Confirm Passwords must match New Password"
    ),
});
const Profile = () => {
  const {
    loading,
    setQuery,
    data: profileData,
  } = useGetCall(SERVICE.GET_PROFILE);

  const {
    Patch: updateProfile,
    error: RequestError,
    loading: profileUploadingLoading,
  } = useActionCall(SERVICE.PROFILE_UPDATE);

  const { Patch: updatePassword, loading: passwordUploadingLoading } =
    useActionCall(SERVICE.CHANGE_PASSWORD);

  const {
    values: profileValues,
    handleChange: handleProfileChange,
    errors: profileErros,
    handleSubmit: handleProfileSubmit,
    setErrors: setProfileError,
  } = useFormik({
    initialValues: {
      first_name: profileData?.data?.first_name ?? "",
      last_name: profileData?.data?.last_name ?? "",
      mobile: profileData?.data?.mobile ?? "",
    },
    onSubmit: async (values: any) => {
      let response = await updateProfile(values);
      if (response) {
        setQuery({});
      }
    },

    validateOnChange: false,
    validateOnBlur: true,
    validationSchema: USER_VALIDATION_SCHEMA,
    enableReinitialize: true,
  });

  const {
    values: passwordValues,
    handleChange: handleChangePassword,
    errors: passwordErrors,
    handleSubmit: handlePasswordSubmit,
  } = useFormik({
    initialValues: {
      current_password: "",
      new_password: "",
    },
    onSubmit: async (values: any) => {
      updatePassword(values);
    },

    validateOnChange: false,
    validateOnBlur: true,
    validationSchema: PASSWORD_VALIDATION_SCHEMA,
  });

  useMemo(() => {
    if (RequestError && Object.keys(RequestError).length) {
      setProfileError(RequestError);
    }
  }, [RequestError]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account and preferences
        </p>
      </div>
      {/* Main Content */}
      {loading ? (
        <Loader />
      ) : (
        <main className="container p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Overview Card */}
            <Card className="lg:col-span-1 shadow-soft h-fit">
              <CardHeader className="text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-background shadow-elegant">
                      <div className="w-full h-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                        <AvatarFallback className="bg-transparent text-white text-3xl font-bold">
                          {Lib.breakTextWhileSpace(
                            `${profileData?.data?.first_name} ${profileData?.data?.last_name}`
                          )}
                        </AvatarFallback>
                      </div>
                    </Avatar>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">
                      {profileData?.data?.first_name}{" "}
                      {profileData?.data?.last_name}
                    </h3>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Settings Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card className="shadow-soft">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    <CardTitle>Personal Information</CardTitle>
                  </div>
                  <CardDescription>
                    Update your personal details and information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <InputText
                        name="first_name"
                        label="First Name *"
                        placeholder="Enter First Name"
                        onChange={handleProfileChange}
                        error={profileErros}
                        value={profileValues}
                      />
                    </div>
                    <div className="space-y-2">
                      <InputText
                        name="last_name"
                        label="Last Name *"
                        placeholder="Enter Last Name"
                        onChange={handleProfileChange}
                        error={profileErros}
                        value={profileValues}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <InputText
                      name="mobile"
                      label="Mobile *"
                      type="number"
                      placeholder="Phone Number"
                      onChange={handleProfileChange}
                      error={profileErros}
                      value={profileValues}
                    />
                  </div>
                  <Btn
                    title="Save Changes"
                    onClick={handleProfileSubmit}
                    isLoading={profileUploadingLoading}
                  />
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card className="shadow-soft">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    <CardTitle>Security</CardTitle>
                  </div>
                  <CardDescription>
                    Manage your password and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <InputText
                      name="current_password"
                      label="Current Password *"
                      type="password"
                      placeholder="Enter Current Password"
                      onChange={handleChangePassword}
                      error={passwordErrors}
                      value={passwordValues}
                    />
                  </div>
                  <div className="space-y-2">
                    <InputText
                      name="new_password"
                      label="Password *"
                      type="password"
                      placeholder="Enter New Password"
                      onChange={handleChangePassword}
                      error={passwordErrors}
                      value={passwordValues}
                    />
                  </div>
                  <div className="space-y-2">
                    <InputText
                      name="password_confirmation"
                      label="Password *"
                      type="password"
                      placeholder="Enter Confirm Password"
                      onChange={handleChangePassword}
                      error={passwordErrors}
                      value={passwordValues}
                    />
                  </div>

                  <Btn
                    title="Update Password"
                    onClick={handlePasswordSubmit}
                    isLoading={passwordUploadingLoading}
                  />

                  <Separator className="my-4" />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};
export default Profile;
