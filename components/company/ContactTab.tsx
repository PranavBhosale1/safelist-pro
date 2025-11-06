import React from "react";

type Contact = {
  countryCode?: string;
  number?: string;
};

type EmailObj = {
  email?: string;
};

type ContactTabData = {
  companyDetails?: {
    result?: Array<{
      contactNumberList?: Contact[];
      emailList?: EmailObj[];
      profileLinks?: Record<string, string | null>;
    }>;
  };
};

export default function ContactTab({ companyData }: { companyData: ContactTabData }) {
  const contactNumbers = companyData?.companyDetails?.result?.[0]?.contactNumberList || [];
  const emails = companyData?.companyDetails?.result?.[0]?.emailList || [];
  const links = companyData?.companyDetails?.result?.[0]?.profileLinks || {};
  const hasContacts = contactNumbers.length > 0 || emails.length > 0;

  if (!hasContacts) {
    return <p>No contact information available.</p>;
  }

  const availableLinks = [
    { name: "Amazon", key: "amazon" },
    { name: "Instagram", key: "instagram" },
    { name: "YouTube", key: "youtube" },
    { name: "Blog", key: "blog" },
    { name: "Facebook", key: "facebook" },
    { name: "LinkedIn", key: "linkedIn" },
    { name: "Twitter", key: "twitter" },
  ].filter((link) => links[link.key]); // Only keep valid URLs

  if (availableLinks.length === 0) {
    return <p><strong>Social Links:</strong> N/A</p>;
  }
  return (
    <div className="space-y-6">
      {contactNumbers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-green-700 mb-2">Contact Numbers</h3>
          <ul className="space-y-2">
            {contactNumbers.map((contact: Contact, index: number) => (
              <li key={index} className="bg-green-50 p-3 rounded-md border border-green-100">
                <p>
                  <strong>Country Code:</strong> {contact?.countryCode ?? "N/A"}
                </p>
                <p>
                  <strong>Number:</strong> {contact?.number ?? "N/A"}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {emails.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-green-700 mb-2">Email Addresses</h3>
          <ul className="space-y-2">
            {emails.map((emailObj: EmailObj, index: number) => (
                  <li key={index} className="bg-green-50 p-3 rounded-md border border-green-100">
                <p>
                  <strong>Email:</strong>{" "}
                  <a
                    href={`mailto:${emailObj?.email ?? ""}`}
                        className="text-green-600 underline"
                  >
                    {emailObj?.email ?? "N/A"}
                  </a>
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
       <p><strong>Social Links:</strong></p>
      <ul className="list-disc list-inside space-y-1">
        {availableLinks.map((link, index) => (
          <li key={index}>
            <a
              href={links[link.key]}
              target="_blank"
              rel="noopener noreferrer"
                  className="text-green-600 underline"
            >
              {link.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
