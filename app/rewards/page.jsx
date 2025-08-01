export default function RewardsPage() {
  const rewards = [
    { name: "Áo thun sự kiện", pointsRequired: 100 },
    { name: "Mystery Box", pointsRequired: 200 }
  ];

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-purple-600 mb-4">Đổi quà</h2>
      <ul className="space-y-2">
        {rewards.map((reward, idx) => (
          <li key={idx} className="flex justify-between bg-gray-50 p-3 rounded-lg shadow-sm">
            <span>{reward.name}</span>
            <span className="font-semibold">{reward.pointsRequired} điểm</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
