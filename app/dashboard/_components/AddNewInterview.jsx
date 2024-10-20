"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAIModal";
import { LoaderCircle } from "lucide-react";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { useRouter } from "next/navigation";

const AddNewInterview = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  const { user } = useUser();
  const router = useRouter();

  const onSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    console.log(jobPosition, jobDesc, jobExperience);

    const InputPrompt = `
      Job Positions: ${jobPosition}, 
      Job Description: ${jobDesc}, 
      Years of Experience: ${jobExperience}. 
      Based on this information, please provide 5 interview questions with answers in JSON format, ensuring "Question" and "Answer" are fields in the JSON.
    `;

    try {
      const result = await chatSession.sendMessage(InputPrompt);
      const responseText = await result.response.text();

      const cleanedJsonString = responseText
        .replace("```json", "")
        .replace("```", "")
        .trim();

      try {
        // Ensure the response is a valid array
        const parsedJson = JSON.parse(cleanedJsonString);
        console.log("Parsed JSON:", parsedJson);

        if (Array.isArray(parsedJson)) {
          const jsonString = JSON.stringify(parsedJson);

          // Insert into the database
          const resp = await db
            .insert(MockInterview)
            .values({
              mockId: uuidv4(),
              jsonMockResp: jsonString,
              jobPosition: jobPosition,
              jobDesc: jobDesc,
              jobExperience: jobExperience,
              createdBy: user?.primaryEmailAddress?.emailAddress,
              createdAt: moment().format("YYYY-MM-DD"),
            })
            .returning({ mockId: MockInterview.mockId });

          console.log("Inserted ID:", resp);

          if (resp) {
            setOpenDialog(false);
            router.push("/dashboard/interview/" + resp[0]?.mockId);
          }
        } else {
          console.log("Invalid response format. Expected an array.");
        }
      } catch (jsonParseError) {
        console.error("Failed to parse JSON response:", jsonParseError);
      }
    } catch (error) {
      console.error("Error fetching or processing the response:", error);
    }

    setLoading(false);
  };

  return (
    <div>
      <div
        className="p-10 rounded-lg border bg-secondary hover:scale-105 hover:shadow-sm transition-all cursor-pointer"
        onClick={() => setOpenDialog(true)}
      >
        <h2 className="text-lg text-center">+ Add New</h2>
      </div>
      <Dialog open={openDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Tell us more about your job interviewing
            </DialogTitle>
            <DialogDescription>
              <form onSubmit={onSubmit}>
                <div className="my-3">
                  <h2>
                    Add Details about your job position, job description, and
                    years of experience
                  </h2>

                  <div className="mt-7 my-3">
                    <label className="text-black">Job Role/Job Position</label>
                    <Input
                      className="mt-1"
                      placeholder="Ex. Full Stack Developer"
                      required
                      value={jobPosition}
                      onChange={(e) => setJobPosition(e.target.value)}
                    />
                  </div>
                  <div className="my-5">
                    <label className="text-black">
                      Job Description/Tech Stack (In Short)
                    </label>
                    <Textarea
                      className="placeholder-opacity-50"
                      placeholder="Ex. React, Angular, Node.js, MySQL, NoSQL, Python"
                      required
                      value={jobDesc}
                      onChange={(e) => setJobDesc(e.target.value)}
                    />
                  </div>
                  <div className="my-5">
                    <label className="text-black">Years of Experience</label>
                    <Input
                      className="mt-1"
                      placeholder="Ex. 5"
                      max="50"
                      type="number"
                      required
                      value={jobExperience}
                      onChange={(e) => setJobExperience(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-5 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOpenDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <LoaderCircle className="animate-spin" />
                        Generating From AI
                      </>
                    ) : (
                      "Start Interview"
                    )}
                  </Button>
                </div>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddNewInterview;
