/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { getAuth } from 'firebase-admin/auth'
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
}

export const getNextScreen = async (decryptedBody: FlowRequest) => {
  const { screen, data, action, flow_token } = decryptedBody;
  
  // handle health check request
  if (action === "ping") {
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
    return {
      screen: "SIGN_UP",
      data: {
        greeting: "Welcome to Goalmatic! 👋",
        subtitle: "Create your account to get started"
      },
    };
  }

  if (action === "data_exchange") {
    // handle the request based on the current screen
    switch (screen) {
      case "SIGN_UP":
        try {
          // Process signup form data
          const { email, password, accept_terms } = data;
          
          // Validation
          if (!email || !password) {
            return {
              screen: "SIGN_UP",
              data: {
                greeting: "Welcome to Goalmatic! 👋",
                subtitle: "Create your account to get started",
                error: {
                  message: "Email and password are required",
                  error_messages: ["Please fill in all required fields"]
                }
              }
            };
          }

          if (!accept_terms) {
            return {
              screen: "SIGN_UP", 
              data: {
                greeting: "Welcome to Goalmatic! 👋",
                subtitle: "Create your account to get started",
                error: {
                  message: "Terms acceptance required",
                  error_messages: ["Please accept the terms and conditions to continue"]
                }
              }
            };
          }

          if (password.length < 6) {
            return {
              screen: "SIGN_UP",
              data: {
                greeting: "Welcome to Goalmatic! 👋",
                subtitle: "Create your account to get started",
                error: {
                  message: "Password too short",
                  error_messages: ["Password must be at least 6 characters long"]
                }
              }
            };
          }

          console.info("Creating user with email:", email);

          // Create Firebase Auth user
          const userRecord = await auth.createUser({
            email: email,
            password: password,
            emailVerified: false,
          });

          // Create user document in Firestore
          await goals_db.collection('users').doc(userRecord.uid).set({
            email: email,
            created_at: new Date(),
            email_verified: false,
            onboarding_completed: false,
            signup_method: 'whatsapp_flow',
            flow_token: flow_token,
          });

          // Generate email verification link
          // const verificationLink = await auth.generateEmailVerificationLink(email);
          // console.info("Verification link generated for:", email);

          // Navigate to verification screen
          return {
            screen: "VERIFY",
            data: {
              user_id: userRecord.uid,
              user_email: email,
              verification_sent: true,
              message: "Account created successfully! Please check your email to verify your account.",
              verified: false,
              reminder: "Don't forget to check your spam folder!"
            },
          };

        } catch (error: any) {
          console.error("Signup error:", error);
          
          let errorMessage = "An error occurred during signup";
          let errorMessages = ["Please try again"];

          if (error.code === 'auth/email-already-exists') {
            errorMessage = "Email already exists";
            errorMessages = ["This email is already registered. Please use a different email or try logging in."];
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = "Invalid email format";
            errorMessages = ["Please enter a valid email address"];
          }

          return {
            screen: "SIGN_UP",
            data: {
              greeting: "Welcome to Goalmatic! 👋",
              subtitle: "Create your account to get started",
              error: {
                message: errorMessage,
                error_messages: errorMessages
              }
            }
          };
        }

      case "VERIFY":
        try {
          const { user_id, email } = data;
          
          if (!user_id) {
            return {
              screen: "SIGN_UP",
              data: {
                greeting: "Welcome to Goalmatic! 👋",
                subtitle: "Create your account to get started",
                error: {
                  message: "Session expired",
                  error_messages: ["Please start the signup process again"]
                }
              }
            };
          }

          // Check if email has been verified
          const userRecord = await auth.getUser(user_id);
          
          if (userRecord.emailVerified) {
            // Update Firestore document
            await goals_db.collection('users').doc(user_id).update({
              email_verified: true,
              verified_at: new Date(),
            });

            return {
              screen: "COMPLETE",
              data: {
                user_id: user_id,
                email: userRecord.email,
                verified: true,
                message: "Email verified successfully!"
              },
            };
          } else {
            return {
              screen: "VERIFY",
              data: {
                user_id: user_id,
                user_email: email,
                verification_sent: true,
                verified: false,
                message: "Email not yet verified. Please check your email and click the verification link.",
                reminder: "Don't forget to check your spam folder!"
              },
            };
          }

        } catch (error: any) {
          console.error("Verification check error:", error);
          return {
            screen: "VERIFY",
            data: {
              user_id: data.user_id || null,
              user_email: data.email || "",
              verification_sent: false,
              verified: false,
              message: "An error occurred while checking verification status.",
              reminder: null,
              error: {
                message: "Verification check failed",
                error_messages: ["Please try again"]
              }
            }
          };
        }

      case "COMPLETE":
        try {
          const { user_id } = data;
          
          if (user_id) {
            // Update user document with completion status
            await goals_db.collection('users').doc(user_id).update({
              onboarding_completed: true,
              completed_at: new Date(),
            });
          }

          // Send success response to complete and close the flow
          return {
            screen: "SUCCESS",
            data: {
              message: "Welcome to Goalmatic! 🎉",
              subtitle: "Your account has been created successfully.",
              action_text: "Get Started",
              extension_message_response: {
                params: {
                  flow_token,
                },
              },
            },
          };

        } catch (error: any) {
          console.error("Completion error:", error);
          return {
            screen: "COMPLETE",
            data: {
              user_id: data.user_id || null,
              email: data.email || "",
              verified: false,
              message: "An error occurred during completion.",
              error: {
                message: "Completion failed",
                error_messages: ["Please try again"]
              }
            }
          };
        }

      default:
        break;
    }
  }

  console.error("Unhandled request body:", decryptedBody);
  throw new Error(
    "Unhandled endpoint request. Make sure you handle the request action & screen logged above."
  );
}; 