import { useEffect, useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import type {
    Customer,
    CreateCustomerRequest,
    UpdateCustomerRequest,
} from "../../types/Customers/customer.types";

interface CustomerFormProps {
    customer?: Customer | null;
    loading?: boolean;
    onSubmit: (
        data: CreateCustomerRequest | UpdateCustomerRequest
    ) => Promise<void>;
    onCancel: () => void;
}

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    isActive: boolean;
}

const initialFormData: FormData = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    isActive: true,
};

function CustomerForm({
    customer,
    loading = false,
    onSubmit,
    onCancel,
}: CustomerFormProps) {
    const isEditMode = Boolean(customer);

    const [formData, setFormData] = useState<FormData>({
        ...initialFormData,
    });

    const [errors, setErrors] = useState<
        Partial<Record<keyof FormData, string>>
    >({});

    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (customer) {
            setFormData({
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phoneNumber: customer.phoneNumber,
                address: customer.address ?? "",
                city: customer.city ?? "",
                state: customer.state ?? "",
                postalCode: customer.postalCode ?? "",
                isActive: customer.isActive,
            });
        } else {
            setFormData({ ...initialFormData });
        }

        setErrors({});
        setCurrentStep(0);
    }, [customer]);

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const target = event.target;

        if (
            target instanceof HTMLInputElement &&
            target.type === "checkbox"
        ) {
            setFormData((current) => ({
                ...current,
                [target.name]: target.checked,
            }));

            return;
        }

        setFormData((current) => ({
            ...current,
            [target.name]: target.value,
        }));

        setErrors((current) => ({
            ...current,
            [target.name]: undefined,
        }));
    };

    const validate = () => {
        const newErrors: Partial<Record<keyof FormData, string>> = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = "First name is required.";
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = "Last name is required.";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
            newErrors.email = "Enter a valid email.";
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = "Phone number is required.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!validate()) {
            setCurrentStep(0);
            return;
        }

        const baseData = {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim(),
            phoneNumber: formData.phoneNumber.trim(),
            address: formData.address.trim() || null,
            city: formData.city.trim() || null,
            state: formData.state.trim() || null,
            postalCode: formData.postalCode.trim() || null,
        };

        if (isEditMode) {
            await onSubmit({
                ...baseData,
                isActive: formData.isActive,
            });

            return;
        }

        await onSubmit(baseData);
    };

    // const goToNextStep = () => {
    //     setCurrentStep(1);
    // };

    const goToPreviousStep = () => {
        setCurrentStep(0);
    };

    const steps = ["Personal", "Address"];

    return (
        <form
            onSubmit={handleSubmit}
            className="flex min-w-0 flex-col gap-5"
        >
            {/* Progress indicator */}
            <div
                className="grid grid-cols-3 gap-3"
                aria-label="Customer form progress"
            >
                {steps.map((step, index) => (
                    <div key={step} className="min-w-0">
                        <div
                            className={`h-1.5 rounded-full transition-colors duration-200 ${index <= currentStep
                                ? "bg-indigo-600"
                                : "bg-slate-200 dark:bg-slate-700"
                                }`}
                        />

                        <p
                            className={`mt-2 truncate text-xs font-medium sm:text-sm ${index === currentStep
                                ? "text-indigo-600 dark:text-indigo-400"
                                : "text-slate-500 dark:text-slate-400"
                                }`}
                        >
                            {index + 1}. {step}
                        </p>
                    </div>
                ))}
            </div>

            {/* Step 1: Personal information */}
            {currentStep === 0 && (
                <section className="min-w-0 space-y-4">
                    <div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            Personal Information
                        </h3>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Enter the customer's contact details.
                        </p>
                    </div>

                    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input
                            id="firstName"
                            name="firstName"
                            label="First Name"
                            value={formData.firstName}
                            onChange={handleChange}
                            error={errors.firstName}
                        />

                        <Input
                            id="lastName"
                            name="lastName"
                            label="Last Name"
                            value={formData.lastName}
                            onChange={handleChange}
                            error={errors.lastName}
                        />

                        <Input
                            id="email"
                            name="email"
                            type="email"
                            label="Email"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                        />

                        <Input
                            id="phoneNumber"
                            name="phoneNumber"
                            label="Phone Number"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            error={errors.phoneNumber}
                        />
                    </div>
                </section>
            )}

            {/* Step 2: Address */}
            {currentStep === 1 && (
                <section className="min-w-0 space-y-4">
                    <div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            Address
                        </h3>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Add the customer's location information.
                        </p>
                    </div>

                    <div className="min-w-0 space-y-4">
                        <Input
                            id="address"
                            name="address"
                            label="Address"
                            value={formData.address}
                            onChange={handleChange}
                        />

                        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                            <Input
                                id="city"
                                name="city"
                                label="City"
                                value={formData.city}
                                onChange={handleChange}
                            />

                            <Input
                                id="state"
                                name="state"
                                label="State"
                                value={formData.state}
                                onChange={handleChange}
                            />

                            <div className="min-w-0 sm:col-span-2">
                                <Input
                                    id="postalCode"
                                    name="postalCode"
                                    label="Postal Code"
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </section>
            )}


            {/* Form actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 dark:border-slate-700 sm:flex-row sm:justify-between">
                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                    <Button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </Button>

                    {currentStep === 1 && (
                        <Button
                            type="button"
                            onClick={goToPreviousStep}
                            disabled={loading}
                            className="w-full sm:w-auto"
                        >
                            Back
                        </Button>
                    )}
                </div>

                {currentStep === 0 ? (
                    <button
                        type="button"
                        onClick={() => {
                            console.log("Continue clicked");
                            setCurrentStep(1);
                        }}
                        disabled={loading}
                        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 sm:w-auto"
                    >
                        Continue
                    </button>
                ) : (
                    <Button
                        type="submit"
                        loading={loading}
                        className="w-full sm:w-auto"
                    >
                        {isEditMode ? "Update Customer" : "Create Customer"}
                    </Button>
                )}
            </div>
        </form>
    );
}

export default CustomerForm;