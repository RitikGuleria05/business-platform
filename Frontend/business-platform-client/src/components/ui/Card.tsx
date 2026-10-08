interface CardProps {
    children: React.ReactNode;
    className?: string;
}

function Card({
    children,
    className = "",
}: CardProps) {
    return (
        <div
            className={`
                min-w-0
                rounded-xl
                border
                border-slate-200
                bg-white
                p-5
                shadow-sm
                ${className}
            `}
        >
            {children}
        </div>
    );
}

export default Card;