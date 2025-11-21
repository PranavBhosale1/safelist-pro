"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { PlusCircleIcon, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import ScriptCard from "@/components/ScriptCard";
import { createClient } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";
import CompanySearchInput from "@/components/CompanySearchInput";
import { encryptBufferBrowser } from "@/components/encryptHandler"; // Import your encryption function
import { useRouter } from "next/navigation";
import { toast } from "sonner";


const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // ✅ public key for client-side use
);

const steps = ["Upload", "Company Info", "Share Info", "Preview"];

type Script = {
  id: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
  uploaded_by: string;
  companyName: string;
  companyurl: string;
  quantity: number;
  price: number;
  validuntil: string;
  legalnotes: string;
  image_url: string;
  verified: boolean | null;
  doc_type: string;
};

export default function SellSharesForm() {
    const { data: session, status } = useSession();
    const [scripts, setScripts] = useState<Script[]>([]);
    const [filter, setFilter] = useState("all"); // "all" | "verified" | "not_verified" | "denied"
    const ENCRYPTION_KEY = "c2e172f0b9b8acdf9d31b9ca8f989c2b"; // 32-byte key for AES-256
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    useEffect(() => {
        if (status === "unauthenticated") {
          router.replace("/auth/signup"); // or "/auth/signin"
        }
      }, [status, router]);
    useEffect(() => {
        const fetchScripts = async () => {
            const user = session?.user?.id;
            console.log("User ID:", user);
            if (!user) {
                console.warn("User not logged in");
                return;
            }

            const { data: scriptsData, error: scriptsError } = await supabase
                .from("esop_docs")
                .select("*")
                .eq("uploaded_by", user);

            if (scriptsError) {
                console.error("Error fetching scripts:", scriptsError);
                return;
            }

            setScripts(scriptsData);
            console.log("Fetched scripts:", scriptsData);
        };

        if (status === "authenticated") {
            fetchScripts();
        }
    }, [status, session]); // ✅ re-run when session is ready




    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(0);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadDone, setUploadDone] = useState(false);
    const [formData, setFormData] = useState({
        companyName: "",
        companyUrl: "",
        quantity: "",
        price: "",
        validUntil: "",
        legalNotes: "",
        image_url: "", // Optional field for image URL
        assetType: "ESOP",
    });

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => {
            const updated = { ...prev, [field]: value };
            console.log(`📝 Changed ${field} → ${value}`);
            console.log("📦 New formData:", updated);
            return updated;
        });
    };


    // the file encryption and watermarking functions

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file && file.type === "application/pdf") {
    setIsLoading(true);
    setUploadDone(false);
    await handleUploadAndWatermark(file);
    setIsLoading(false);
  } else if (file) {
    alert("Please select a PDF file.");
  }
};


const handleUploadAndWatermark = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("watermark",  `${session?.user?.id}`);

    const res = await fetch("/api/watermark", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      console.error("Failed to watermark file");
      alert("Failed to process file. Please try again.");
      setIsLoading(false);
      return;
    }

    const blob = await res.blob();
    const watermarkedFile = new File([blob], file.name.replace(".pdf", "-watermarked.pdf"), {
      type: "application/pdf",
    });

    console.log("✅ Watermarked File:", watermarkedFile);

    // 🔐 Encrypt and prepare for upload
    const arrayBuffer = await watermarkedFile.arrayBuffer();
    const encryptedBuffer = await encryptBufferBrowser(new Uint8Array(arrayBuffer), ENCRYPTION_KEY);
    const encryptedFile = new File([encryptedBuffer.buffer as ArrayBuffer], `${file.name}.enc`, {
      type: "application/octet-stream",
    });

    setFile(encryptedFile);
    setUploadDone(true);
    console.log("✅ File processed successfully");
  } catch (error) {
    console.error("Error processing file:", error);
    alert("Error processing file. Please try again.");
    setIsLoading(false);
  }
};


    // end of the file encryption and watermarking functions



    const handleUpload = async () => {
        // If already processed, move to next step
        if (uploading === 2 || uploadDone) {
            setStep(2);
            return;
        }
        
        // Prevent multiple uploads or if file not ready
        if (!file || !uploadDone) {
            alert("Please wait for the file to be processed.");
            return;
        }
        
        // Move to next step since file is already processed
        setUploading(2);
        setStep(2);
    };

    const handleSubmit = async () => {
        // Prevent multiple submissions
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        
        // Create a new FormData instance for each submission
        const doc_data = new FormData();
        doc_data.append("file", file);
        doc_data.append("companyName", formData.companyName);
        doc_data.append("companyUrl", formData.companyUrl);
        doc_data.append("quantity", formData.quantity);
        doc_data.append("price", formData.price);
        doc_data.append("validUntil", formData.validUntil);
        doc_data.append("legalNotes", formData.legalNotes);
        doc_data.append("image_url", formData.image_url); // Optional image URL
        doc_data.append("assetType", formData.assetType);
        console.log("Submitted:", doc_data);

        try {
            const res = await fetch("/api/upload-doc", {
                method: "POST",
                body: doc_data, // Don't set Content-Type manually
            });

            const data = await res.json();
            console.log("Response:", data);

            if (res.ok) {
                // Show success toast with admin review notice
                toast.success("Document uploaded successfully!", {
                    description: "Your listing has been submitted and will be reviewed by an admin. You'll be notified once it's approved.",
                    duration: 5000,
                });
                
                setOpen(false);
                // Reset form data
                setFormData({
                    companyName: "",
                    companyUrl: "",
                    quantity: "",
                    price: "",
                    validUntil: "",
                    legalNotes: "",
                    image_url: "",
                    assetType: "ESOP",
                });
                setFile(null);
                setUploadDone(false);
                setUploading(0);
                setStep(1);
                // Refresh the scripts list
                window.location.reload();
            } else {
                console.error("Upload failed:", data.error);
                toast.error("Upload failed", {
                    description: data.error || "Unknown error occurred. Please try again.",
                });
            }
        } catch (err) {
            console.error("Upload failed:", err);
            toast.error("Upload failed", {
                description: err instanceof Error ? err.message : "Unknown error occurred. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
            setUploading(0);
        }
    };

    const isStepValid = () => {
        switch (step) {
            case 1:
                return file !== null && uploadDone;

            case 2:
                console.log("Validating step 2:", formData.companyName, formData.companyUrl);
                return formData.companyUrl.trim() !== "" && formData.companyName.trim() !== "";

            case 3: {
                const quantity = formData.quantity.trim();
                const price = formData.price.trim();
                const validUntil = formData.validUntil.trim();

                // Validate number fields
                if (!quantity || !price) return false;

                // Validate validUntil date
                const selectedDate = new Date(validUntil);
                const today = new Date();
                const lowerLimit = new Date("1947-01-01");

                // Only date portion matters
                selectedDate.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);

                const isValidDate =
                    !isNaN(selectedDate.getTime()) &&
                    selectedDate >= today &&             // not in the past
                    selectedDate <= new Date("2100-12-31") && // optional upper limit
                    selectedDate >= lowerLimit;          // not before 1947

                return isValidDate;
            }


            default:
                return true;
        }
    };


    return (
        <div className="min-h-screen bg-white text-gray-900 px-6 py-10">
            {/* Title always at top on mobile */}
            <h1 className="text-3xl font-bold text-green-700 mb-4 md:mb-0">Your Verified Listings</h1>
            {/* Filter and New Script Button: stacked on mobile, row on desktop */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0 mb-6">
                <select
                    value={ filter }
                    onChange={ (e) => setFilter(e.target.value) }
                    className="px-3 py-2 rounded-lg bg-white text-gray-900 border-2 border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 shadow-sm transition-all md:mb-0 mb-2 md:w-auto w-full"
                >
                    <option value="all">All Scripts</option>
                    <option value="verified">Verified</option>
                    <option value="not_verified">Not Verified</option>
                    <option value="denied">denied</option>
                </select>
                <Button
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-bold shadow-md border-2 border-green-600 hover:scale-105 transition-all md:ml-4 md:w-auto w-full"
                    onClick={ () => {
                        setOpen(true);
                        setStep(1);
                    } }
                >
                    <PlusCircleIcon className="mr-2 h-4 w-4" /> Sell New Shares
                </Button>
            </div>

            {status === 'loading' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-green-50 p-6 rounded-xl border-2 border-green-200 shadow-md h-40" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    { scripts
                        .filter((script) => {
                            if (filter === "all") return true;
                            if (filter === "verified") return script.verified === true;
                            if (filter === "not_verified") return script.verified === null;
                            // Treat `denied` as explicit null/undefined (or a separate denied status if you use one)
                            if (filter === "denied") return script.verified === false || script.verified === undefined;
                            return true;
                        })
                        .map((script) => (
                            <ScriptCard key={ script.id } script={ script } />
                        )) }
                </div>
            )}

            <Dialog
                open={ open }
                onOpenChange={ (isOpen) => {
                    setOpen(isOpen); // still update state normally

                    if (!isOpen) {
                        // ✅ Dialog just closed
                        console.log("Dialog closed!");
                        // You can reset form data, step, etc.
                        setStep(1);
                        setFile(null);
                        setUploadDone(false);
                        setUploading(0);
                    }
                } }
            >
                <DialogContent className="max-w-lg bg-white backdrop-blur-xl border-2 border-green-300 shadow-xl p-8 rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-green-700">List Your Shares</DialogTitle>
                    </DialogHeader>

                    {/* Step Indicators */ }
                    <div className="flex justify-between text-sm mb-6 ">
                        { steps.map((s, i) => (
                            <div
                                key={ i }
                                className={ cn(
                                    "flex-1 text-center",
                                    step === i + 1 ? "text-green-600 font-semibold" : "text-gray-500"
                                ) }
                            >
                                { i + 1 }. { s }
                            </div>
                        )) }
                    </div>

                    {/* Step 1 */ }
                    { step === 1 && (
                        <div className="space-y-4  flex flex-col items-center justify-center ">
                            <Label htmlFor="file">Upload ESOP / Allotment Document (PDF)</Label>
                            <Input id="file" type="file" accept=".pdf" onChange={handleFileChange} required />
                            {isLoading && (
                              <div className="flex flex-col items-center justify-center py-4">
                                <Loader2 className="animate-spin text-green-600 w-10 h-10" />
                                <p className="text-sm text-gray-600 mt-2">Processing file...</p>
                              </div>
                            )}
                            {uploadDone && !isLoading && (
                              <p className="text-green-500 text-sm">File ready ✅</p>
                            )}
                            <Button
                              type="button"
                              className="w-fit bg-green-600 border-2 border-green-400 p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={handleUpload}
                              disabled={isLoading || !uploadDone}
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="animate-spin mr-2 w-5 h-5" />
                                  Processing...
                                </>
                              ) : uploadDone ? (
                                "Continue"
                              ) : (
                                "Upload Document"
                              )}
                            </Button>
                        </div>
                    ) }

                    {/* Step 2 */ }
                    { step === 2 && (
                        <div className="space-y-4">
                            <label className="block mb-1 text-sm font-medium text-gray-900">Asset Type</label>
                            <select
                                value={ formData.assetType }
                                onChange={ (e) => handleChange("assetType", e.target.value) }
                                className="w-full px-3 py-2 rounded bg-white text-gray-900 border-2 border-green-300 focus:ring-green-500 focus:border-green-600"
                            >
                                <option value="ESOP">ESOP</option>
                                <option value="Shares">Shares</option>
                            </select>
                            <CompanySearchInput
                                companyName={ formData.companyName }
                                companyUrl={ formData.companyUrl }
                                image_url={ formData.image_url } // Pass image URL to component
                                onChange={ (name, url, image_url) => {
                                    handleChange("companyName", name);
                                    handleChange("companyUrl", url);
                                    handleChange("image_url", image_url); // Reset image URL when company changes
                                } }
                            />
                            <div className="flex justify-between">
                                <Button type="button"  className="w-fit bg-green-600 border-2 border-green-400 p-2 rounded-lg" onClick={ () => setStep(1) } variant="outline">
                                    Back
                                </Button>
                                <Button
                                    type="button"
                                    onClick={ () => setStep(3) }
                                     className="w-fit bg-green-600 border-2 border-green-400 p-2 rounded-lg"
                                    disabled={ !isStepValid() }
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    ) }

                    {/* Step 3 */ }
                    { step === 3 && (
                        <div className="space-y-4 text-black">
                            <Label>Number of Shares</Label>
                            <Input
                                type="number"
                                value={ formData.quantity }
                                onChange={ (e) => handleChange("quantity", e.target.value) }
                                required
                            />
                            <Label>Asking Price per Share (₹)</Label>
                            <Input
                                type="number"
                                value={ formData.price }
                                onChange={ (e) => handleChange("price", e.target.value) }
                                required
                            />
                            <Label>Sale Valid Until</Label>
                            <Input
                                type="date"
                                value={ formData.validUntil }
                                className="bg-white text-gray-900 border-green-300"
                                onChange={ (e) => handleChange("validUntil", e.target.value) }
                                required
                            />
                            <Label>Legal Notes / Declaration</Label>
                            <Textarea
                                rows={ 3 }
                                value={ formData.legalNotes }
                                onChange={ (e) => handleChange("legalNotes", e.target.value) }
                               className="bg-white text-amber-900 border-green-300"
                            />
                            <div className="flex justify-between">
                                <Button type="button" 
                                 className="w-fit bg-green-600 border-2 border-green-400 p-2 rounded-lg"
                                onClick={ () => setStep(2) } variant="outline">
                                    Back
                                </Button>
                                <Button
                                    type="button"
                                    onClick={ () => setStep(4) }
                                     className="w-fit bg-green-600 border-2 border-green-400 p-2 rounded-lg"
                                    disabled={ !isStepValid() }
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    ) }

                    {/* Step 4 */ }
                    { step === 4 && (
                        <div className="space-y-4">
                            <Label>Preview Listing</Label>
                            <Textarea
                                readOnly
                                rows={ 6 }
                                className="text-green-700"
                                value={ `${formData.companyName}
Website: ${formData.companyUrl}
${formData.assetType}: ${formData.quantity}
Price: ₹${formData.price}
Valid till: ${formData.validUntil}
Legal Notes: ${formData.legalNotes}` }
                            />
                            <div className="flex justify-between">
                                <Button type="button"
                                 className="w-fit bg-green-600 border-2 border-green-400 p-2 rounded-lg"
                                onClick={ () => setStep(3) } variant="outline">
                                    Back
                                </Button>
                                <Button type="button" className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-xl shadow-md border-2 border-green-600 hover:scale-105 transition-all" onClick={ handleSubmit } disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Confirm & Submit"
                                    )}
                                </Button>
                            </div>
                        </div>
                    ) }
                </DialogContent>
            </Dialog>


        </div>
    );
}
