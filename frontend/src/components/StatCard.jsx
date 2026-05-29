function StatCard({ title, value, icon, className = "" }) {
    return (
        <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-950 ${className}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm font-semibold mb-2">{title}</p>
                    <p className="text-3xl font-bold text-gray-800">
                        {typeof value === "number" ? value.toLocaleString() : value}
                    </p>
                </div>
                {icon && <div className="text-3xl text-blue-950 opacity-20">{icon}</div>}
            </div>
        </div>
    );
}

export default StatCard;