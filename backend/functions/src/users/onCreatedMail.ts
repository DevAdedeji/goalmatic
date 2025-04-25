const currentYear = new Date().getFullYear();

const welcomeNewUserTemplate = (name: string) => `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Goalmatic!</title>
    <!--[if mso]>
    <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
    </style>
    <![endif]-->
</head>

<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; color: #333333; line-height: 1.5; background-color: #f4f4f4;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
        <tr>
            <td style="padding: 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 720px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                    <!-- Header with Logo -->
                    <tr>
                        <td style="padding: 20px 30px;">
                            <img src="https://www.goalmatic.io/mail-logo.png" alt="Goalmatic" width="150" style="display: block;">
                        </td>
                    </tr>

                    <!-- Banner Image -->
                    <tr>
                        <td>
                            <img src="https://www.goalmatic.io/mailHeader.png" alt="Goalmatic Banner" width="600" style="display: block; width: 100%; height: auto; border-radius: 8px;">
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 30px;">
                            <!-- Welcome Text -->
                            <h1 style="font-size: 24px; margin-top: 0; margin-bottom: 15px; color: #333333;">Welcome to Goalmatic!</h1>

                            <p style="margin-top: 0; margin-bottom: 15px; font-size: 16px;">Hi ${name || 'New User'}, We're so excited to have you join our community! You've taken the first step towards turning your dreams into reality with Goalmatic.</p>

                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="padding: 20px 0; border-top: 1px solid #e5e5e5;"></td>
                                </tr>
                            </table>

                            <!-- What You Can Do Section -->
                            <h2 style="font-size: 18px; margin-top: 0; margin-bottom: 15px; color: #333333;">Here's what you can do with Goalmatic</h2>

                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="padding-bottom: 15px; padding-left: 5px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td width="25" style="vertical-align: top;">•</td>
                                                <td style="font-size: 16px;">Transform your aspirations into clear, actionable plans.</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 15px; padding-left: 5px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td width="25" style="vertical-align: top;">•</td>
                                                <td style="font-size: 16px;">Break down big goals into manageable milestones and to-dos.</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 15px; padding-left: 5px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td width="25" style="vertical-align: top;">•</td>
                                                <td style="font-size: 16px;">Get personalized support from our AI assistant to stay on track.</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Getting Started Section -->
                            <h2 style="font-size: 18px; margin-top: 15px; margin-bottom: 15px; color: #333333;">Getting Started is Simple:</h2>

                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="padding-bottom: 15px; padding-left: 5px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td width="25" style="vertical-align: top;">•</td>
                                                <td style="font-size: 16px;">Create your first goal: Start by defining what you want to achieve.</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 15px; padding-left: 5px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td width="25" style="vertical-align: top;">•</td>
                                                <td style="font-size: 16px;">Connect your favorite apps: Integrate with WhatsApp, Google Calendar, and more to streamline your workflow.</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 15px; padding-left: 5px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td width="25" style="vertical-align: top;">•</td>
                                                <td style="font-size: 16px;">Utilize our AI Agents: Select a public agent or create your own to guide you towards your goal.</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="padding: 20px 0; border-top: 1px solid #e5e5e5;"></td>
                                </tr>
                            </table>

                            <!-- Call to Action -->
                            <h2 style="font-size: 18px; margin-top: 0; margin-bottom: 20px; color: #333333; text-align: center;">Ready to Make Your Goals a Reality?</h2>

                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;">
                                            <tr style="width:100%;">
                                                <td style="border-radius: 8px; background-color: #111827; text-align: center; width:100%;">
                                                    <a href="https://www.goalmatic.io/goals" target="_blank" style="display: inline-block; padding: 15px 30px; font-size: 16px; color: #ffffff; text-decoration: none; font-weight: bold; width:100%;">Go to dashboard</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="padding: 20px 0; border-top: 1px solid #e5e5e5;"></td>
                                </tr>
                            </table>

                            <!-- Footer -->
                            <p style="margin-top: 0; margin-bottom: 15px; font-size: 16px;">We're here to support you every step of the way. If you have any questions, just reply to this email!</p>

                            <p style="margin-top: 0; margin-bottom: 5px; font-size: 16px;">Best Regards,</p>
                            <p style="margin-top: 0; margin-bottom: 30px; font-size: 16px; font-weight: bold;">The Goalmatic Team</p>

                            <p style="margin-top: 30px; margin-bottom: 15px; font-size: 14px; color: #888888; font-style: italic;">feel free to reply to this email if you have any questions.</p>

                            <p style="margin-top: 15px; font-size: 12px; color: #999999;">© Copyright Goalmatic. ${currentYear}. All rights reserved!</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>

`



type WelcomeNewUserType = {
    email: string
    name: string,
    
}
export const welcomeNewGoalmaticUserMsg = (data: WelcomeNewUserType) => {
    return {
        to: [{ email: data.email, name: data.name }],
        from: { email: 'anthony@goalmatic.io', name: 'Goalmatic' },
        subject: `${data.name}, Welcome to Goalmatic`,
        message_body: {
            type: 'text/html',
            value: welcomeNewUserTemplate(data.name)
        },
    }
}
