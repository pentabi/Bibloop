export interface PrayerRequest {
  id: string;
  author: string;
  title: string;
  content: string;
  createdAt: string;
  viewCount: number;
  displayUntil: string;
}

export const mockPrayerRequests: PrayerRequest[] = [
  {
    id: "1",
    author: "田中恵美",
    title: "母の病気のために",
    content:
      "母が突然体調を崩し、来週検査を受けることになりました。結果が良い知らせでありますように、また母が平安を保てるようにお祈りください。",
    createdAt: "2024-08-04T09:00:00Z",
    viewCount: 0,
    displayUntil: "2024-08-18T09:00:00Z",
  },
  {
    id: "2",
    author: "鈴木一郎",
    title: "転職活動のために",
    content:
      "現在の職場での人間関係に悩み、転職を考えています。神様の御心に適った新しい道が開かれますように、また決断する知恵をお与えください。",
    createdAt: "2024-08-03T14:30:00Z",
    viewCount: 3,
    displayUntil: "2024-08-31T14:30:00Z",
  },
  {
    id: "3",
    author: "中村雅子",
    title: "息子の受験のために",
    content:
      "高校3年生の息子が大学受験を控えています。勉強に集中できるように、また親として適切なサポートができるようにお祈りください。",
    createdAt: "2024-08-02T19:45:00Z",
    viewCount: 7,
    displayUntil: "2025-03-31T19:45:00Z",
  },
  {
    id: "4",
    author: "渡辺光子",
    title: "霊的成長のために",
    content:
      "最近祈りの時間が短くなり、神様との関係が希薄になっているように感じます。もう一度主との親密な関係を回復できるようにお祈りください。",
    createdAt: "2024-08-01T21:15:00Z",
    viewCount: 1,
    displayUntil: "2024-09-01T21:15:00Z",
  },
  {
    id: "5",
    author: "加藤誠",
    title: "感謝の報告：新しい仕事が決まりました",
    content:
      "先月お祈りをお願いした転職の件で、神様が素晴らしい会社を備えてくださいました。皆さんのお祈りに心から感謝します！",
    createdAt: "2024-07-30T16:20:00Z",
    viewCount: 12,
    displayUntil: "2024-08-30T16:20:00Z",
  },
  {
    id: "6",
    author: "橋本明子",
    title: "教会の奉仕について",
    content:
      "新しく始まる子ども会の奉仕を任されました。子どもたちに福音を伝える働きが祝福されるように、また準備に知恵が与えられますようにお祈りください。",
    createdAt: "2024-07-29T13:45:00Z",
    viewCount: 5,
    displayUntil: "2024-08-29T13:45:00Z",
  },
  {
    id: "7",
    author: "森田拓也",
    title: "父との関係修復のために",
    content:
      "長年疎遠だった父と和解したいと思っています。プライドを捨てて最初の一歩を踏み出す勇気と、お互いの心が柔らかくなるようにお祈りください。",
    createdAt: "2024-07-28T20:10:00Z",
    viewCount: 2,
    displayUntil: "2024-10-28T20:10:00Z",
  },
];
