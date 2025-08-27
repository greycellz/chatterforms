/**
 * ChatterForms Cloud Functions
 * Handles form submissions with HIPAA compliance
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/v2/https";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {getStorage} from "firebase-admin/storage";
import {getAuth} from "firebase-admin/auth";

// Initialize Firebase Admin
initializeApp();

// Set global options for cost control
setGlobalOptions({ maxInstances: 10 });

const db = getFirestore();
const storage = getStorage();
const auth = getAuth();

/**
 * Process form submission and store securely
 */
export const processFormSubmission = onRequest(
  {
    maxInstances: 10,
    cors: true,
  },
  async (request, response) => {
    try {
      const {formId, formData, userId, isHipaa = false} = request.body;

      if (!formId || !formData) {
        response.status(400).json({error: "Missing required fields"});
        return;
      }

      // Generate unique submission ID
      const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Store submission in Firestore
      const submissionData = {
        submission_id: submissionId,
        form_id: formId,
        user_id: userId || "anonymous",
        submission_data: formData,
        timestamp: new Date(),
        ip_address: request.ip,
        user_agent: request.get("User-Agent"),
        is_hipaa: isHipaa,
        encrypted: false, // Will be encrypted by KMS
      };

      await db.collection("submissions").doc(submissionId).set(submissionData);

      // Update form analytics
      await updateFormAnalytics(formId, userId);

      logger.info("Form submission processed", {
        submissionId,
        formId,
        isHipaa,
      });

      response.status(200).json({
        success: true,
        submissionId,
        message: "Form submitted successfully",
      });
    } catch (error) {
      logger.error("Error processing form submission", error);
      response.status(500).json({error: "Internal server error"});
    }
  }
);

/**
 * Update form analytics when a submission is created
 */
export const onSubmissionCreated = onDocumentCreated(
  "submissions/{submissionId}",
  async (event) => {
    try {
      const submissionData = event.data?.data();
      if (!submissionData) return;

      const {form_id, user_id, timestamp} = submissionData;

      // Update form analytics
      await updateFormAnalytics(form_id, user_id);

      logger.info("Form analytics updated", {form_id});
    } catch (error) {
      logger.error("Error updating form analytics", error);
    }
  }
);

/**
 * Helper function to update form analytics
 */
async function updateFormAnalytics(formId: string, userId: string) {
  const analyticsRef = db.collection("form_analytics").doc(formId);

  try {
    await db.runTransaction(async (transaction) => {
      const analyticsDoc = await transaction.get(analyticsRef);

      if (analyticsDoc.exists) {
        // Update existing analytics
        const data = analyticsDoc.data()!;
        transaction.update(analyticsRef, {
          submissions_count: (data.submissions_count || 0) + 1,
          last_submission: new Date(),
        });
      } else {
        // Create new analytics entry
        transaction.set(analyticsRef, {
          form_id: formId,
          user_id: userId,
          submissions_count: 1,
          last_submission: new Date(),
          created_at: new Date(),
          is_hipaa: false,
          is_published: true,
        });
      }
    });
  } catch (error) {
    logger.error("Error updating form analytics", error);
  }
}

/**
 * Health check endpoint
 */
export const healthCheck = onRequest(
  {
    maxInstances: 5,
  },
  (request, response) => {
    response.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "ChatterForms Cloud Functions",
    });
  }
);
