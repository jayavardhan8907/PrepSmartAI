"use client";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Lightbulb, WebcamIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Webcam from "react-webcam";
import Link from "next/link";
import { useContext } from 'react';
import { WebCamContext } from "../../layout";

const Interview = ({ params }) => {
  const { webCamEnabled, setWebCamEnabled } = useContext(WebCamContext);
  const [interviewData, setInterviewData] = useState();
  const [mockInterviewQuestion, setMockInterviewQuestion] = useState([]);
  
  useEffect(() => {
    console.log(params.interviewId);
    GetInterviewDetails();
  }, []);
  
  const GetInterviewDetails = async () => {
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, params.interviewId));
      
    if (result.length > 0) {
      const rawJsonMockResp = result[0].jsonMockResp;
      console.log("Raw JSON:", rawJsonMockResp);  // Log the raw JSON response for debugging
  
      try {
        // Remove the double serialization by parsing the string and correcting it to an array
        const correctedJsonString = `[${rawJsonMockResp}]`;
        const jsonMockResp = JSON.parse(correctedJsonString.replace(/\\/g, '').replace(/^"+|"+$/g, ''));
  
        console.log("Parsed JSON Response:", jsonMockResp);
        setMockInterviewQuestion(jsonMockResp);
        setInterviewData(result[0]);
      } catch (error) {
        // Log parsing errors for further inspection
        console.error("JSON Parsing Error:", error);
        console.log("Invalid JSON string:", rawJsonMockResp);
      }
    }
  };
  
  
  return (
    <div className="my-10">
      <h2 className="font-bold text-2xl text-center">Let's Get Started</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="flex flex-col my-5 gap-5">
          <div className="flex flex-col p-5 rounded-lg border gap-5">
            <h2 className="text-lg">
              <strong>Job Role/Job Position: </strong>
              {interviewData?.jobPosition}
            </h2>
            <h2 className="text-lg">
              <strong>Job Description/Job Stack: </strong>
              {interviewData?.jobDesc}
            </h2>
            <h2 className="text-lg">
              <strong>Years of Experience: </strong>
              {interviewData?.jobExperience}
            </h2>
          </div>
          <div className="p-5 border rounded-lg border-yellow-300 bg-yellow-100">
            <h2 className="flex gap-2 items-center text-yellow-700 mb-2">
              <Lightbulb />
              <strong>Information</strong>
            </h2>
            <h2 className="mt-3 text-yellow-500">
              {process.env.NEXT_PUBLIC_INFORMATION}
            </h2>
          </div>
        </div>
        <div>
          {webCamEnabled ? (
            <div className="flex items-center justify-center p-10">
              <Webcam
                onUserMedia={() => setWebCamEnabled(true)}
                onUserMediaError={() => setWebCamEnabled(false)}
                height={300}
                width={300}
                mirrored={true}
              />
            </div>
          ) : (
            <div>
              <WebcamIcon className="h-72 w-full my-6 p-20 bg-secondary rounded-lg border" />
            </div>
          )}
          <div>
            <Button
              className={`${webCamEnabled ? "w-full" : "w-full"}`}
              onClick={() => setWebCamEnabled((prev) => !prev)}
            >
              {webCamEnabled ? "Close WebCam" : "Enable WebCam"}
            </Button>
          </div>
        </div>
      </div>
      <div className="flex justify-center my-4 md:my-0 md:justify-end md:items-end">
        <Link href={"/dashboard/interview/" + params.interviewId + "/start"}>
          <Button>Start Interview</Button>
        </Link>
      </div>
      {/* Render Interview Questions */}
      <div className="my-5">
        <h2 className="font-bold text-xl">Interview Questions:</h2>
        {mockInterviewQuestion.length > 0 ? (
          <div className="mt-3">
            {mockInterviewQuestion.map((questionItem, index) => (
              <div key={index} className="my-3 p-4 border rounded-lg bg-white">
                <h3 className="text-lg font-semibold">
                  Q{index + 1}: {questionItem.Question}
                </h3>
                <p className="text-md mt-2">
                  <strong>Answer:</strong> {questionItem.Answer}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mt-3">No interview questions available.</p>
        )}
      </div>
    </div>
  );
};

export default Interview;
