class FormulaManager {
    constructor() {
        this.formulas = [];
        this.initialize();
    }

    initialize() {
        this.setupFormulas();
    }

    setupFormulas() {
        const formulaElements = document.getElementsByTagName('formula');
        Array.from(formulaElements).forEach(formula => this.setupFormula(formula));
    }

    setupFormula(formulaElement) {
        const expression = formulaElement.getAttribute('evaluator');
        if (!expression) {
            this.showError(formulaElement);
            return;
        }

        const variables = this.extractVariables(expression);
        const inputs = this.validateInputs(variables, formulaElement);
        if (!inputs) return;

        const evaluator = this.createEvaluator(expression, variables, formulaElement);
        this.addEventListeners(inputs, evaluator);
        evaluator();
    }

    extractVariables(expression) {
        const variableRegex = /\b[a-zA-Z_$][a-zA-Z\d_$]*\b/g;
        return [...new Set(expression.match(variableRegex) || [])];
    }

    validateInputs(variables, formulaElement) {
        const inputs = [];
        for (const varName of variables) {
            const input = document.getElementById(varName);
            if (!input) {
                this.showError(formulaElement);
                return null;
            }
            inputs.push(input);
        }
        return inputs;
    }

    createEvaluator(expression, variables, formulaElement) {
        return () => {
            const values = {};
            let isValid = true;

            for (const varName of variables) {
                const value = parseFloat(document.getElementById(varName).value);
                if (isNaN(value)) {
                    isValid = false;
                    break;
                }
                values[varName] = value;
            }

            if (!isValid) {
                this.showError(formulaElement);
                return;
            }

            try {
                const result = this.evaluateExpression(expression, values);
                formulaElement.textContent = Number.isInteger(result) ? 
                    result : result.toFixed(2);
            } catch (error) {
                this.showError(formulaElement);
            }
        };
    }

    evaluateExpression(expression, values) {
        const parsedExpression = expression.replace(
            /\b[a-zA-Z_$][a-zA-Z\d_$]*\b/g,
            match => values[match] ?? match
        );
        
        const result = eval(parsedExpression);
        if (typeof result !== 'number' || !isFinite(result)) {
            throw new Error('Invalid result');
        }
        return result;
    }

    addEventListeners(inputs, evaluator) {
        inputs.forEach(input => {
            input.addEventListener('input', evaluator);
            input.addEventListener('change', evaluator);
        });
    }

    showError(formulaElement) {
        formulaElement.textContent = 'Invalid Formula';
        formulaElement.style.color = '#ff4444';
    }
}

document.addEventListener('DOMContentLoaded', () => new FormulaManager());