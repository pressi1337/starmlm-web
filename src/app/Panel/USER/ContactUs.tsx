import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Building2, CreditCard, Hash, User, HelpCircle } from "lucide-react";
import { useGetCall } from "@/hooks";
import { SERVICE } from "@/constants/services";
import Loader from "@/components/ui/Loader";

const ContactUs = () => {
  const {
    loading,
    data: bankData,
  } = useGetCall(SERVICE.GET_ADMIN_BANK_DETAILS);
  const { loading: helpLoading, data: supportData } = useGetCall(SERVICE.SUPPORT_HELP);

  if (loading || helpLoading) {
    return <Loader />;
  }

  const bankDetails = bankData?.data || {};
  const helpItems = supportData?.data || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Support & Help</h1>
        <p className="mt-2 text-gray-600">
          Find quick answers and contact details whenever you need support
        </p>
      </div>

      <Card className="shadow-soft mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <CardTitle>Quick Help Answers</CardTitle>
          </div>
          <CardDescription>
            Repeated questions answered automatically for faster support
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {helpItems.length > 0 ? (
            helpItems.map((item: any) => (
              <div key={item.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="font-semibold text-gray-900">{item.question}</div>
                <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{item.answer}</div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No help answers configured yet.</div>
          )}
        </CardContent>
      </Card>

      {/* Bank Information Card */}
      <Card className="shadow-soft">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <CardTitle>Banking Information</CardTitle>
          </div>
          <CardDescription>
            Our banking details for payments and transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Account Number */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Account Number</div>
                <div className="text-sm text-gray-600">For fund transfers</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-semibold">
                {bankDetails.account_number || "N/A"}
              </span>
            </div>
          </div>

          {/* Account Holder Name */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Account Holder Name</div>
                <div className="text-sm text-gray-600">Beneficiary name</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {bankDetails.account_holder_name || "N/A"}
              </span>
            </div>
          </div>

          {/* IFSC Code */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Hash className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">IFSC Code</div>
                <div className="text-sm text-gray-600">Bank identifier code</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-semibold uppercase">
                {bankDetails.ifsc_code || "N/A"}
              </span>
            </div>
          </div>

          {/* Bank Name */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Bank Name</div>
                <div className="text-sm text-gray-600">Financial institution</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {bankDetails.bank_name || "N/A"}
              </span>
            </div>
          </div>

          {/* Branch Name */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Branch Name</div>
                <div className="text-sm text-gray-600">Bank branch location</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {bankDetails.branch_name || "N/A"}
              </span>
            </div>
          </div>

          {/* WhatsApp Number */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">WhatsApp Number</div>
                <div className="text-sm text-gray-600">Contact for support</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-semibold">
                {bankDetails.whatsapp_number || "N/A"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

     
    </div>
  );
};

export default ContactUs;
