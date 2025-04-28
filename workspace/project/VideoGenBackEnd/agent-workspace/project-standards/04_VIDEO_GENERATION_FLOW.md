# Video Generation Flow Checklist

This document outlines the complete flow for video generation, from frontend request to completion, with status indicators for each step and detailed implementation steps to fix the issues.

## Legend
- ✅ Working correctly
- ❌ Not working / Issue identified
- ⚠️ Partially working / Needs verification
- 🔴 Critical missing component
- 🛑 Breaking Point - Where the process fails first

## 1. Frontend Image Upload Flow
- ✅ User uploads image via frontend
- ✅ Frontend sends image to backend `/api/images/upload` endpoint
- ✅ Backend stores image in storage (Supabase)
- ✅ Backend creates record in `projects` table with:
  - ✅ `id` (generated UUID)
  - ✅ `user_id` (from auth)
  - ✅ `image_url` (URL to the uploaded image)
- ✅ Backend returns `projectId` and `imageUrl` to frontend

## 2. Frontend Video Generation Request
- ✅ User enters prompt and submits generation request
- ✅ Frontend sends request to `/api/videos/generate` with:
  - ✅ `projectId` (from the project created in step 1)
  - ✅ `prompt` (text prompt for video generation)
- ✅ Backend validates request parameters

## 3. Backend Video Generation Processing
- ✅ Backend extracts `projectId` and `prompt` from request
- ✅ Backend validates user has access to the project
- ✅ Backend fetches project record using `projectId` to get `image_url`
- ✅ Backend creates a new record in the `generations` table with:
  - ✅ `id` (generated UUID)
  - ✅ `project_id` (links to the project)
  - ✅ `user_id` (from auth)
  - ✅ `prompt` (from request)
  - ✅ `status` (initially "queued")
  - ✅ `metadata` (including timestamp)
- ✅ Backend returns `generationId` to frontend immediately

## 4. Asynchronous Video Generation
- ✅ Backend (asynchronously) initiates video generation with Runway:
  - ✅ Sends `imageUrl` (from project record)
  - ✅ Sends `prompt` (from request)
  - 🛑 **BREAKING POINT**: RunwayClient attempts to call `text2video` method which doesn't exist
  - ❌ Receives Runway job ID
- ❌ Backend updates generation record with Runway job ID
- ❌ Backend sets up monitoring for generation status

## 5. Frontend Status Checking
- ✅ Frontend polls `/api/videos/status/:generationId` endpoint
- ✅ Backend queries `generations` table for status
- ✅ Backend returns current status to frontend (returns "failed" due to the error)

## 6. Status Updates
- ❌ Backend periodically checks status with Runway
- ⚠️ Backend updates generation record status as it progresses:
  - ✅ "queued" → "generating" 
  - ❌ "generating" → "processing" → "completed" (process fails at "generating")
- ❌ Backend downloads video from Runway URL when generation is complete
- ❌ Backend processes video and uploads to permanent storage
- ❌ Backend stores permanent video URL when generation completes

## 7. Completion Handling
- ❌ Backend updates generation record when complete:
  - ❌ Sets `status` to "completed"
  - ❌ Sets `video_url` to the URL of the generated video (now using permanent storage URL)
  - ❌ Sets `completed_at` timestamp
- ❌ Frontend displays the generated video when status is "completed"

## 8. Error Handling
- ✅ Backend handles errors during generation:
  - ✅ Sets `status` to "failed"
  - ✅ Sets `error_message` with details (logs show error is captured)
- ⚠️ Frontend displays appropriate error messages

## Current Issues

The following issues have been identified and addressed:

1. ✅ **Fixed: RunwayClient Integration Failure**: The `RunwayClient` implementation has been updated to use the correct methods from the RunwayML SDK. The client now uses `imageToVideo.create()` instead of the non-existent `inference.text2video()` method.

2. ⚠️ **Error Message Handling**: While the status is correctly set to "failed" when an error occurs, the error message details may not be properly stored in the generation record. This needs verification.

3. ⚠️ **Video Processing Flow**: Now that the Runway API integration is fixed, we need to verify that the subsequent steps in the video generation flow (downloading, processing, and storing the video) are working correctly.

## Implementation Changes Made

### 1. Fixed RunwayClient Implementation

**File**: `src/services/video/runway/client.ts`

- Updated the client to use the correct RunwayML SDK methods:
  - Changed from `inference.text2video()` to `imageToVideo.create()`
  - Changed from `inference.getStatus()` to `tasks.retrieve()`
- Updated the parameter names to match the SDK:
  - Changed from `prompt` to `promptText`
  - Added `promptImage` for the image URL
- Removed the combined prompt string that was incorrectly including the image URL in the text prompt

### 2. Updated RunwayML Types

**File**: `src/services/video/runway/types.ts`

- Updated the `RunwayStatus` type to include all possible statuses from the SDK
- Added a `TaskRetrieveResponse` interface to match the SDK's response format
- Updated the `RUNWAY_STATUS_MAP` to handle all possible statuses
- Removed the incorrect `RunwayMLSDK` interface

## Testing

Continue using the testing guide in [VIDEO_GENERATION_TESTING.md](./VIDEO_GENERATION_TESTING.md) to verify the fixes. The next steps are:

1. Test the complete video generation flow with the fixed RunwayClient
2. Verify that videos are properly downloaded, processed, and stored
3. Ensure that error handling is working correctly

## Conclusion

The critical issue with the RunwayClient implementation has been fixed. The client now correctly uses the RunwayML SDK methods for video generation and status checking. The next step is to verify that the complete video generation flow is working correctly, including the video processing and storage steps.
