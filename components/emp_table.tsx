import React from "react";

type Employee = {
  id: string;
  name: string;
  designation: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  profileLinks?: {
    linkedinHandle?: string;
  };
  shortBio?: string;
};

export default function EmployeeTable({ employees }: { employees: Employee[] }) {
  if (!employees || employees.length === 0) {
    return <p className="text-gray-600">No employee information available.</p>;
  }

  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full border border-gray-200 text-sm text-left text-black">
        <thead className="bg-green-700 text-white">
          <tr>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Designation</th>
            <th className="px-4 py-2 border">Location</th>
            <th className="px-4 py-2 border">LinkedIn</th>
            <th className="px-4 py-2 border">Short Bio</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {employees.map((emp) => (
            <tr key={emp.id} className="border-t border-gray-200">
              <td className="px-4 py-2 border">{emp.name}</td>
              <td className="px-4 py-2 border">{emp.designation}</td>
              <td className="px-4 py-2 border">
                {emp.location?.city}, {emp.location?.state}, {emp.location?.country}
              </td>
              <td className="px-4 py-2 border">
                {emp.profileLinks?.linkedinHandle ? (
                  <a href={emp.profileLinks.linkedinHandle} target="_blank" rel="noopener noreferrer" className="text-green-600 underline">
                    LinkedIn
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-2 border text-gray-700">{emp.shortBio || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
