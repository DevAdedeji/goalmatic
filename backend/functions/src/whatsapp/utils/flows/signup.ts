/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { getAuth } from 'firebase-admin/auth'
import { Timestamp } from 'firebase-admin/firestore'
import { v4 as uuidv4 } from 'uuid'
import { goals_db } from '../../../init'
import firebaseServer from '../../../init'

// Initialize Firebase Admin Auth
const auth = getAuth(firebaseServer()!)

interface FlowRequest {
  screen?: string;
  data?: any;
  version?: string;
  action: string;
  flow_token: string;
  flow_id?: string;
}

// Helper function to extract phone number from WhatsApp context
const extractPhoneFromContext = (flow_token: string): string | null => {
  try {
    // First, try to decode the flow_token if it's base64 encoded JSON
    let decodedData: any = null;
    
    try {
      // Try to parse as JSON first
      decodedData = JSON.parse(flow_token);
    } catch {
      try {
        // Try to decode as base64 then parse as JSON
        const decoded = Buffer.from(flow_token, 'base64').toString('utf-8');
        decodedData = JSON.parse(decoded);
      } catch {
        // If decoding fails, treat as plain text
        decodedData = { text: flow_token };
      }
    }
    
    // Extract phone number from structured data
    if (decodedData && typeof decodedData === 'object') {
      // Common field names where phone number might be stored
      const phoneFields = ['phone', 'phone_number', 'phoneNumber', 'from', 'sender', 'user_phone'];
      
      for (const field of phoneFields) {
        if (decodedData[field]) {
          const extractedPhone = extractPhoneNumber(decodedData[field]);
          if (extractedPhone) return extractedPhone;
        }
      }
      
      // Check nested objects
      for (const key in decodedData) {
        if (typeof decodedData[key] === 'object' && decodedData[key] !== null) {
          for (const field of phoneFields) {
            if (decodedData[key][field]) {
              const extractedPhone = extractPhoneNumber(decodedData[key][field]);
              if (extractedPhone) return extractedPhone;
            }
          }
        }
      }
    }
    
    // Fallback: use regex to extract phone number from the entire token
    const phoneFromToken = extractPhoneNumber(flow_token);
    if (phoneFromToken) return phoneFromToken;
    
    // If structured data exists, try to extract from any string values
    if (decodedData && typeof decodedData === 'object') {
      const searchText = JSON.stringify(decodedData);
      return extractPhoneNumber(searchText);
    }
    
    return null;
  } catch (error) {
    console.warn('Error extracting phone from context:', error);
    // Final fallback: try regex on the raw token
    return extractPhoneNumber(flow_token);
  }
}

// Helper function to extract phone number using regex
const extractPhoneNumber = (text: string): string | null => {
  if (!text || typeof text !== 'string') return null;
  
  // Comprehensive regex pattern for international phone numbers
  // This pattern matches various formats including:
  // +1234567890, +32 484 48 76 94, 0484487694, (123) 456-7890, etc.
  const phoneRegex = /(\+?\d{1,4}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g;
  
  const matches = text.match(phoneRegex);
  
  if (matches && matches.length > 0) {
    // Return the first valid phone number found
    for (const match of matches) {
      const cleaned = match.replace(/[-.\s()]/g, '');
      
      // Basic validation: phone number should be 7-15 digits
      if (cleaned.length >= 7 && cleaned.length <= 15) {
        // Ensure it starts with + for international format
        if (cleaned.startsWith('+')) {
          return cleaned;
        } else if (cleaned.match(/^\d+$/)) {
          // If it's all digits, add + prefix
          return `+${cleaned}`;
        }
      }
    }
  }
  
  return null;
}

// Helper function to create SIGN_UP screen response
const createSignUpScreen = (phoneNumber: string, error?: { message: string; error_messages: string[] }) => {
  return {
    screen: "SIGN_UP",
    data: {
      greeting: "Welcome to Goalmatic! 👋",
      img: "https://goalmatic.io/mail.png",
      subtitle: "Complete your account setup",
      phone_number: phoneNumber,
      ...(error && { error })
    }
  };
}

export const getNextScreen = async (decryptedBody: FlowRequest & { webhook_phone_number?: string }) => {
  const { screen, data, action, flow_token, webhook_phone_number } = decryptedBody;
  
  // handle health check request
  if (action === "ping") {
    console.log("📱 Ping request received");
    return {
      data: {
        status: "active",
      },
    };
  }

  // handle error notification
  if (data?.error) {
    console.warn("Received client error:", data);
    return {
      data: {
        acknowledged: true,
      },
    };
  }

  // handle initial request when opening the flow
  if (action === "INIT") {
    // Use phone number from webhook context first, then try extracting from flow_token as fallback
    const userPhoneNumber = webhook_phone_number || 
                           extractPhoneFromContext(flow_token);
    
    console.log("📱 Using phone number for signup:", userPhoneNumber);
    
    // If no phone number available, show error screen
    if (!userPhoneNumber) {
      console.warn("❌ No phone number available for signup flow");
      return createSignUpScreen(
        "Phone number not available", 
        {
          message: "Unable to determine phone number",
          error_messages: ["Please contact support or try again later."]
        }
      );
    }
    
    return createSignUpScreen(userPhoneNumber);
  }

  if (action === "data_exchange") {
    // handle the request based on the current screen
    switch (screen) {
      case "SIGN_UP":
        try {
          // Process signup form data
          const { full_name, accept_terms, phone_number } = data;
          
          // Use webhook phone number or fallback to form data or extraction
          const actualPhoneNumber = webhook_phone_number || 
                                   phone_number || 
                                   extractPhoneFromContext(flow_token);
          
          console.log("📱 Signup using phone number:", actualPhoneNumber);
          
          // Validation
          if (!full_name || full_name.trim().length === 0) {
            return createSignUpScreen(
              actualPhoneNumber,
              {
                message: "Full name is required",
                error_messages: ["Please enter your full name"]
              }
            );
          }

          if (!accept_terms) {
            return createSignUpScreen(
              actualPhoneNumber,
              {
                message: "Terms acceptance required",
                error_messages: ["You must accept the terms and conditions to continue"]
              }
            );
          }

          if (!actualPhoneNumber) {
            return createSignUpScreen(
              actualPhoneNumber,
              {
                message: "Phone number required",
                error_messages: ["Unable to determine your phone number. Please contact support."]
              }
            );
          }

          // Ensure phone number is properly formatted
          const formattedPhone = actualPhoneNumber.startsWith('+') ? actualPhoneNumber : `+${actualPhoneNumber}`;

          // Check if phone number is already registered
          const existingUser = await goals_db.collection('users')
            .where('phone', '==', formattedPhone)
            .get();

          if (!existingUser.empty) {
            return createSignUpScreen(
              formattedPhone,
              {
                message: "Account already exists",
                error_messages: ["An account with this phone number already exists. Please contact support if this is an error."]
              }
            );
          }

          console.info("Creating account for phone:", formattedPhone);

          // Create Firebase Auth user with phone number
          // Since this is initiated from WhatsApp, we consider the phone number verified
          const userRecord = await auth.createUser({
            phoneNumber: formattedPhone,
            disabled: false,
          });

          // Create user document in Firestore
          await goals_db.collection('users').doc(userRecord.uid).set({
            id: userRecord.uid,
            name: full_name.trim(),
            photo_url: null,
            email: null,
            phone: formattedPhone,
            username: full_name.trim(),
            referred_by: null,
            created_at: Timestamp.fromDate(new Date()),
            updated_at: Timestamp.fromDate(new Date()),
            timezone: 'UTC',
            signup_method: 'whatsapp_flow_phone',
            phone_verified: true, // Consider verified since initiated from WhatsApp
            onboarding_completed: true, // Complete onboarding since it's simplified
            flow_token: flow_token,
          });

          // Create WhatsApp integration
          const integrationId = uuidv4();
          await goals_db.collection('users').doc(userRecord.uid).collection('integrations').doc(integrationId).set({
            id: integrationId,
            type: 'MESSAGING',
            provider: 'WHATSAPP',
            phone: formattedPhone,
            created_at: Timestamp.fromDate(new Date()),
            updated_at: Timestamp.fromDate(new Date()),
            integration_id: 'WHATSAPP',
            user_id: userRecord.uid,
          });

          // Navigate directly to completion screen
          return {
            screen: "COMPLETE",
            data: {
              user_id: userRecord.uid,
              img:"https://goalmatic.io/og.png",
              full_name: full_name.trim(),
              phone_number: formattedPhone,
              verified: true,
              message: "Account created successfully!"
            },
          };

        } catch (error: any) {
          console.error("Signup error:", error);
          
          // Use webhook phone number or fallback to form data or extraction for error response
          const errorPhoneNumber = webhook_phone_number || 
                                  data.phone_number || 
                                  extractPhoneFromContext(flow_token) ||
                                  "Phone number unavailable";
          
          let errorMessage = "An error occurred during signup";
          let errorMessages = ["Please try again"];

          if (error.code === 'auth/phone-number-already-exists') {
            errorMessage = "Phone number already registered";
            errorMessages = ["This phone number is already registered. Please contact support."];
          } else if (error.code === 'auth/invalid-phone-number') {
            errorMessage = "Invalid phone number";
            errorMessages = ["The provided phone number is invalid."];
          }
          
          return createSignUpScreen(
            errorPhoneNumber,
            {
              message: errorMessage,
              error_messages: errorMessages
            }
          );
        }

      default:
        break;
    }
  }

  // Handle completion action
  if (action === "complete") {
    try {
      const { user_id, full_name, phone_number } = data;
      
      // Log successful completion
      console.info("Flow completed successfully for user:", user_id);
      
      // Return success response
      return {
        data: {
          status: "success",
          img:"https://goalmatic.io/og.png",
          message: `Welcome to Goalmatic, ${full_name}!`,
          user_id: user_id,
          phone_number: phone_number
        }
      };

    } catch (error: any) {
      console.error("Completion error:", error);
      return {
        data: {
          status: "error",
          message: "An error occurred during completion."
        }
      };
    }
  }

  console.error("Unhandled request body:", decryptedBody);
  throw new Error(
    "Unhandled endpoint request. Make sure you handle the request action & screen logged above."
  );
}; 