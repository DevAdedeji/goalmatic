import { WorkflowContext } from "@upstash/workflow";
import { FlowNode } from "../../../type";
import { processMentionsProps } from "../../../../../utils/processMentions";
import { generateAiFlowContext } from "../../../../../utils/generateAiFlowContext";

const formatData = async (_context: WorkflowContext, step: FlowNode, previousStepResult: any) => {
    try {
        // Resolve mentions and AI fields first
        const processedProps = processMentionsProps(step.propsData, previousStepResult);
        const { processedPropsWithAiContext } = await generateAiFlowContext(step, processedProps);

        const { inputData, formatterFunction } = processedPropsWithAiContext as {
            inputData: any;
            formatterFunction: string;
        };

        if (!formatterFunction || typeof formatterFunction !== 'string' || formatterFunction.trim().length === 0) {
            return { success: false, error: 'Formatter function is required' };
        }

        // Execute the user-provided formatter function safely
        let result: any;
        try {
            const wrapper = new Function('input', `
        try {
          const formatter = ${formatterFunction};
          if (typeof formatter === 'function') {
            return formatter(input);
          } else {
            throw new Error('Formatter must be a function');
          }
        } catch (error) {
          console.error('Formatter function execution error:', error);
          throw new Error('Formatter function error: ' + (error && error.message ? error.message : String(error)));
        }
      `);

            result = wrapper(inputData);
        } catch (err: any) {
            return { success: false, error: err?.message || 'Failed to execute formatter function' };
        }

        // Normalize output to a string for downstream messaging
        let formattedText: string;
        if (typeof result === 'string') {
            formattedText = result;
        } else if (Array.isArray(result) || (result && typeof result === 'object')) {
            formattedText = JSON.stringify(result, null, 2);
        } else {
            formattedText = String(result);
        }

        const totalItems = Array.isArray(inputData) ? inputData.length : undefined;

        return {
            success: true,
            payload: {
                ...processedPropsWithAiContext,
                formattedText,
                rawResult: result,
                totalItems
            }
        };
    } catch (error: any) {
        console.error('Error in FORMAT_DATA node:', error);
        return { success: false, error: error?.message || 'FORMAT_DATA failed' };
    }
};

export const formatDataNode = {
    nodeId: 'FORMAT_DATA',
    run: formatData
};

