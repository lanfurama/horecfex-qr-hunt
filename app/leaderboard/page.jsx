export default function LeaderboardPage() {
  const leaderboard = [
    { name: "Nguyễn Văn A", points: 120 },
    { name: "Trần Văn B", points: 95 },
    { name: "Lê Thị C", points: 80 }
  ];

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-indigo-600 mb-4">Bảng xếp hạng</h2>
      <ul className="space-y-2">
        {leaderboard.map((player, idx) => (
          <li key={idx} className="flex justify-between bg-gray-50 p-3 rounded-lg shadow-sm">
            <span>{idx + 1}. {player.name}</span>
            <span className="font-semibold">{player.points} điểm</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
