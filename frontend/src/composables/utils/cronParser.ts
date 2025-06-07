import cronstrue from 'cronstrue'

export const parseCronExpression = (expression: string) => {
    return cronstrue.toString(expression)
}


