import { useEffect, useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from "../../types/Customers/customer.types";

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

function CustomerForm({
    customer,
    loading = false,
    onSubmit,
    onCancel,
}: CustomerFormProps) {
    const isEditMode = Boolean(customer);

    const [formData, setFormData] = useState<FormData>({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        isActive: true,
    });

    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

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
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phoneNumber: "",
                address: "",
                city: "",
                state: "",
                postalCode: "",
                isActive: true,
            });
        }

        setErrors({});
    }, [customer]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                formData.email
            )
        ) {
            newErrors.email = "Enter a valid email.";
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber =
                "Phone number is required.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!validate()) {
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
            postalCode:
                formData.postalCode.trim() || null,
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

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            <div>
                <h3 className="text-sm font-semibold text-slate-900">
                    Personal Information
                </h3>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            </div>

            <div>
                <h3 className="text-sm font-semibold text-slate-900">
                    Address
                </h3>

                <div className="mt-4 space-y-4">
                    <Input
                        id="address"
                        name="address"
                        label="Address"
                        value={formData.address}
                        onChange={handleChange}
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

            {isEditMode && (
                <label className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />

                    <span className="text-sm font-medium text-slate-700">
                        Active customer
                    </span>
                </label>
            )}

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <Button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    loading={loading}
                >
                    {isEditMode
                        ? "Update Customer"
                        : "Create Customer"}
                </Button>
            </div>
        </form>
    );
}

export default CustomerForm;