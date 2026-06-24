export interface Team {
  id: string; name: string; group: string; code: string; flagEmoji: string;
  confederation: string; eloRating: number; worldRank: number; projectedPoints: number;
  form: string; simWinPct: number;
}

export interface Player {
  id: string; name: string; country: string; position: string; club: string;
  age: number; goals: number; assists: number; rating: number; marketValueM: number;
  fantasyPoints: number; injuryRisk: 'low' | 'medium' | 'high'; minutesPlayed: number;
  yellowCards: number; redCards: number; keyPasses: number; tacklesWon: number; cleanSheets: number;
}

export interface Match {
  id: string; group: string; home: string; away: string; date: string; venue: string;
  homeGoals: number | null; awayGoals: number | null;
  homeProbWin: number; drawProb: number; awayProbWin: number;
}

export interface SimResult {
  team: string; flag: string; r16Pct: number; qfPct: number; sfPct: number; finalPct: number; winPct: number;
}

export const TEAMS: Team[] = [
  { id: 'USA', name: 'United States', group: 'A', code: 'USA', flagEmoji: '🇺🇸', confederation: 'CONCACAF', eloRating: 1850, worldRank: 11, projectedPoints: 7, form: 'WWDWD', simWinPct: 4.5 },
  { id: 'CAN', name: 'Canada', group: 'A', code: 'CAN', flagEmoji: '🇨🇦', confederation: 'CONCACAF', eloRating: 1750, worldRank: 40, projectedPoints: 4, form: 'LWDDW', simWinPct: 0.8 },
  { id: 'MEX', name: 'Mexico', group: 'A', code: 'MEX', flagEmoji: '🇲🇽', confederation: 'CONCACAF', eloRating: 1800, worldRank: 15, projectedPoints: 6, form: 'DWWLD', simWinPct: 2.1 },
  { id: 'POL', name: 'Poland', group: 'A', code: 'POL', flagEmoji: '🇵🇱', confederation: 'UEFA', eloRating: 1780, worldRank: 28, projectedPoints: 0, form: 'LLDLL', simWinPct: 0.5 },

  { id: 'BRA', name: 'Brazil', group: 'B', code: 'BRA', flagEmoji: '🇧🇷', confederation: 'CONMEBOL', eloRating: 2100, worldRank: 1, projectedPoints: 9, form: 'WWWWW', simWinPct: 15.2 },
  { id: 'ARG', name: 'Argentina', group: 'B', code: 'ARG', flagEmoji: '🇦🇷', confederation: 'CONMEBOL', eloRating: 2080, worldRank: 2, projectedPoints: 6, form: 'WWLWW', simWinPct: 14.1 },
  { id: 'GER', name: 'Germany', group: 'B', code: 'GER', flagEmoji: '🇩🇪', confederation: 'UEFA', eloRating: 1950, worldRank: 16, projectedPoints: 3, form: 'WLDWL', simWinPct: 8.5 },
  { id: 'FRA', name: 'France', group: 'B', code: 'FRA', flagEmoji: '🇫🇷', confederation: 'UEFA', eloRating: 2090, worldRank: 3, projectedPoints: 0, form: 'WWWWD', simWinPct: 13.8 },

  { id: 'ENG', name: 'England', group: 'C', code: 'ENG', flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', confederation: 'UEFA', eloRating: 2020, worldRank: 4, projectedPoints: 9, form: 'WWWWL', simWinPct: 9.2 },
  { id: 'ESP', name: 'Spain', group: 'C', code: 'ESP', flagEmoji: '🇪🇸', confederation: 'UEFA', eloRating: 2050, worldRank: 8, projectedPoints: 6, form: 'WWDWW', simWinPct: 11.5 },
  { id: 'POR', name: 'Portugal', group: 'C', code: 'POR', flagEmoji: '🇵🇹', confederation: 'UEFA', eloRating: 1980, worldRank: 6, projectedPoints: 4, form: 'WWLWW', simWinPct: 7.3 },
  { id: 'NED', name: 'Netherlands', group: 'C', code: 'NED', flagEmoji: '🇳🇱', confederation: 'UEFA', eloRating: 1960, worldRank: 7, projectedPoints: 0, form: 'LWDWL', simWinPct: 5.1 },

  { id: 'MAR', name: 'Morocco', group: 'D', code: 'MAR', flagEmoji: '🇲🇦', confederation: 'CAF', eloRating: 1880, worldRank: 12, projectedPoints: 7, form: 'WDWWL', simWinPct: 3.8 },
  { id: 'NGA', name: 'Nigeria', group: 'D', code: 'NGA', flagEmoji: '🇳🇬', confederation: 'CAF', eloRating: 1760, worldRank: 35, projectedPoints: 5, form: 'WWDDL', simWinPct: 1.2 },
  { id: 'SEN', name: 'Senegal', group: 'D', code: 'SEN', flagEmoji: '🇸🇳', confederation: 'CAF', eloRating: 1820, worldRank: 18, projectedPoints: 4, form: 'DWWLD', simWinPct: 1.9 },
  { id: 'EGY', name: 'Egypt', group: 'D', code: 'EGY', flagEmoji: '🇪🇬', confederation: 'CAF', eloRating: 1700, worldRank: 50, projectedPoints: 0, form: 'DLLLD', simWinPct: 0.4 },

  { id: 'JPN', name: 'Japan', group: 'E', code: 'JPN', flagEmoji: '🇯🇵', confederation: 'AFC', eloRating: 1870, worldRank: 17, projectedPoints: 7, form: 'WWDWL', simWinPct: 2.9 },
  { id: 'KOR', name: 'South Korea', group: 'E', code: 'KOR', flagEmoji: '🇰🇷', confederation: 'AFC', eloRating: 1790, worldRank: 22, projectedPoints: 5, form: 'WWLDD', simWinPct: 1.5 },
  { id: 'AUS', name: 'Australia', group: 'E', code: 'AUS', flagEmoji: '🇦🇺', confederation: 'AFC', eloRating: 1720, worldRank: 45, projectedPoints: 3, form: 'DWLWL', simWinPct: 0.7 },
  { id: 'IRN', name: 'Iran', group: 'E', code: 'IRN', flagEmoji: '🇮🇷', confederation: 'AFC', eloRating: 1760, worldRank: 30, projectedPoints: 0, form: 'LLDWL', simWinPct: 0.3 },

  { id: 'BEL', name: 'Belgium', group: 'F', code: 'BEL', flagEmoji: '🇧🇪', confederation: 'UEFA', eloRating: 1920, worldRank: 5, projectedPoints: 7, form: 'WWWLW', simWinPct: 5.8 },
  { id: 'CRO', name: 'Croatia', group: 'F', code: 'CRO', flagEmoji: '🇭🇷', confederation: 'UEFA', eloRating: 1900, worldRank: 10, projectedPoints: 5, form: 'DWWWD', simWinPct: 3.6 },
  { id: 'DEN', name: 'Denmark', group: 'F', code: 'DEN', flagEmoji: '🇩🇰', confederation: 'UEFA', eloRating: 1870, worldRank: 20, projectedPoints: 3, form: 'LWDWL', simWinPct: 2.2 },
  { id: 'SUI', name: 'Switzerland', group: 'F', code: 'SUI', flagEmoji: '🇨🇭', confederation: 'UEFA', eloRating: 1840, worldRank: 21, projectedPoints: 0, form: 'DLLDD', simWinPct: 0.9 },

  { id: 'URU', name: 'Uruguay', group: 'G', code: 'URU', flagEmoji: '🇺🇾', confederation: 'CONMEBOL', eloRating: 1890, worldRank: 14, projectedPoints: 7, form: 'WWWLD', simWinPct: 4.1 },
  { id: 'COL', name: 'Colombia', group: 'G', code: 'COL', flagEmoji: '🇨🇴', confederation: 'CONMEBOL', eloRating: 1810, worldRank: 19, projectedPoints: 5, form: 'WWDLL', simWinPct: 2.0 },
  { id: 'CHI', name: 'Chile', group: 'G', code: 'CHI', flagEmoji: '🇨🇱', confederation: 'CONMEBOL', eloRating: 1770, worldRank: 32, projectedPoints: 3, form: 'DLWLL', simWinPct: 0.6 },
  { id: 'ECU', name: 'Ecuador', group: 'G', code: 'ECU', flagEmoji: '🇪🇨', confederation: 'CONMEBOL', eloRating: 1740, worldRank: 38, projectedPoints: 0, form: 'LLLDD', simWinPct: 0.3 },

  { id: 'SRB', name: 'Serbia', group: 'H', code: 'SRB', flagEmoji: '🇷🇸', confederation: 'UEFA', eloRating: 1800, worldRank: 25, projectedPoints: 6, form: 'WWDWL', simWinPct: 1.8 },
  { id: 'CZE', name: 'Czech Republic', group: 'H', code: 'CZE', flagEmoji: '🇨🇿', confederation: 'UEFA', eloRating: 1760, worldRank: 33, projectedPoints: 5, form: 'DWWLD', simWinPct: 1.1 },
  { id: 'TUR', name: 'Turkey', group: 'H', code: 'TUR', flagEmoji: '🇹🇷', confederation: 'UEFA', eloRating: 1800, worldRank: 26, projectedPoints: 4, form: 'LWDWW', simWinPct: 1.3 },
  { id: 'HUN', name: 'Hungary', group: 'H', code: 'HUN', flagEmoji: '🇭🇺', confederation: 'UEFA', eloRating: 1730, worldRank: 44, projectedPoints: 0, form: 'LLDLL', simWinPct: 0.2 },

  { id: 'GHA', name: 'Ghana', group: 'I', code: 'GHA', flagEmoji: '🇬🇭', confederation: 'CAF', eloRating: 1720, worldRank: 48, projectedPoints: 6, form: 'WWLWL', simWinPct: 0.9 },
  { id: 'CMR', name: 'Cameroon', group: 'I', code: 'CMR', flagEmoji: '🇨🇲', confederation: 'CAF', eloRating: 1740, worldRank: 42, projectedPoints: 5, form: 'WWDDL', simWinPct: 0.8 },
  { id: 'TUN', name: 'Tunisia', group: 'I', code: 'TUN', flagEmoji: '🇹🇳', confederation: 'CAF', eloRating: 1700, worldRank: 55, projectedPoints: 3, form: 'DWLDL', simWinPct: 0.4 },
  { id: 'ALG', name: 'Algeria', group: 'I', code: 'ALG', flagEmoji: '🇩🇿', confederation: 'CAF', eloRating: 1720, worldRank: 52, projectedPoints: 0, form: 'DLLLL', simWinPct: 0.2 },

  { id: 'SAU', name: 'Saudi Arabia', group: 'J', code: 'SAU', flagEmoji: '🇸🇦', confederation: 'AFC', eloRating: 1700, worldRank: 58, projectedPoints: 5, form: 'WWDLL', simWinPct: 0.5 },
  { id: 'QAT', name: 'Qatar', group: 'J', code: 'QAT', flagEmoji: '🇶🇦', confederation: 'AFC', eloRating: 1660, worldRank: 70, projectedPoints: 4, form: 'DDWLL', simWinPct: 0.3 },
  { id: 'UAE', name: 'UAE', group: 'J', code: 'UAE', flagEmoji: '🇦🇪', confederation: 'AFC', eloRating: 1620, worldRank: 80, projectedPoints: 3, form: 'LWDLD', simWinPct: 0.2 },
  { id: 'IRQ', name: 'Iraq', group: 'J', code: 'IRQ', flagEmoji: '🇮🇶', confederation: 'AFC', eloRating: 1640, worldRank: 75, projectedPoints: 0, form: 'LLLDD', simWinPct: 0.1 },

  { id: 'CRC', name: 'Costa Rica', group: 'K', code: 'CRC', flagEmoji: '🇨🇷', confederation: 'CONCACAF', eloRating: 1720, worldRank: 46, projectedPoints: 6, form: 'WWLWD', simWinPct: 0.6 },
  { id: 'PAN', name: 'Panama', group: 'K', code: 'PAN', flagEmoji: '🇵🇦', confederation: 'CONCACAF', eloRating: 1680, worldRank: 65, projectedPoints: 4, form: 'DDDWL', simWinPct: 0.3 },
  { id: 'JAM', name: 'Jamaica', group: 'K', code: 'JAM', flagEmoji: '🇯🇲', confederation: 'CONCACAF', eloRating: 1640, worldRank: 82, projectedPoints: 3, form: 'LWDLD', simWinPct: 0.1 },
  { id: 'HON', name: 'Honduras', group: 'K', code: 'HON', flagEmoji: '🇭🇳', confederation: 'CONCACAF', eloRating: 1610, worldRank: 90, projectedPoints: 0, form: 'LLLLL', simWinPct: 0.1 },

  { id: 'NZL', name: 'New Zealand', group: 'L', code: 'NZL', flagEmoji: '🇳🇿', confederation: 'OFC', eloRating: 1600, worldRank: 95, projectedPoints: 7, form: 'WWWWL', simWinPct: 0.3 },
  { id: 'FIJ', name: 'Fiji', group: 'L', code: 'FIJ', flagEmoji: '🇫🇯', confederation: 'OFC', eloRating: 1500, worldRank: 140, projectedPoints: 3, form: 'WDLWL', simWinPct: 0.1 },
  { id: 'TAH', name: 'Tahiti', group: 'L', code: 'TAH', flagEmoji: '🇵🇫', confederation: 'OFC', eloRating: 1480, worldRank: 155, projectedPoints: 1, form: 'LLDLD', simWinPct: 0.05 },
  { id: 'SOL', name: 'Solomon Islands', group: 'L', code: 'SOL', flagEmoji: '🇸🇧', confederation: 'OFC', eloRating: 1470, worldRank: 160, projectedPoints: 0, form: 'LLLLL', simWinPct: 0.05 },
];

export const PLAYERS: Player[] = [
  { id: 'p1', name: 'Christian Pulisic', country: 'USA', position: 'LW', club: 'AC Milan', age: 27, goals: 3, assists: 2, rating: 8.2, marketValueM: 50, fantasyPoints: 45, injuryRisk: 'medium', minutesPlayed: 360, yellowCards: 1, redCards: 0, keyPasses: 12, tacklesWon: 4, cleanSheets: 0 },
  { id: 'p2', name: 'Alphonso Davies', country: 'Canada', position: 'LB', club: 'Bayern Munich', age: 25, goals: 1, assists: 4, rating: 8.5, marketValueM: 70, fantasyPoints: 52, injuryRisk: 'low', minutesPlayed: 360, yellowCards: 0, redCards: 0, keyPasses: 8, tacklesWon: 15, cleanSheets: 2 },
  { id: 'p3', name: 'Vinicius Jr', country: 'Brazil', position: 'LW', club: 'Real Madrid', age: 25, goals: 5, assists: 3, rating: 9.1, marketValueM: 150, fantasyPoints: 85, injuryRisk: 'low', minutesPlayed: 400, yellowCards: 2, redCards: 0, keyPasses: 20, tacklesWon: 5, cleanSheets: 0 },
  { id: 'p4', name: 'Kylian Mbappe', country: 'France', position: 'ST', club: 'Real Madrid', age: 27, goals: 8, assists: 2, rating: 9.5, marketValueM: 180, fantasyPoints: 95, injuryRisk: 'low', minutesPlayed: 450, yellowCards: 0, redCards: 0, keyPasses: 15, tacklesWon: 2, cleanSheets: 0 },
  { id: 'p5', name: 'Lionel Messi', country: 'Argentina', position: 'AM', club: 'Inter Miami', age: 38, goals: 2, assists: 5, rating: 8.8, marketValueM: 30, fantasyPoints: 60, injuryRisk: 'medium', minutesPlayed: 300, yellowCards: 1, redCards: 0, keyPasses: 25, tacklesWon: 1, cleanSheets: 0 },
  { id: 'p6', name: 'Jamal Musiala', country: 'Germany', position: 'AM', club: 'Bayern Munich', age: 23, goals: 4, assists: 4, rating: 8.7, marketValueM: 110, fantasyPoints: 70, injuryRisk: 'low', minutesPlayed: 380, yellowCards: 0, redCards: 0, keyPasses: 18, tacklesWon: 8, cleanSheets: 0 },
  { id: 'p7', name: 'Jude Bellingham', country: 'England', position: 'CM', club: 'Real Madrid', age: 22, goals: 6, assists: 3, rating: 9.2, marketValueM: 160, fantasyPoints: 88, injuryRisk: 'low', minutesPlayed: 450, yellowCards: 1, redCards: 0, keyPasses: 22, tacklesWon: 12, cleanSheets: 0 },
  { id: 'p8', name: 'Pedri', country: 'Spain', position: 'CM', club: 'Barcelona', age: 23, goals: 3, assists: 5, rating: 9.0, marketValueM: 140, fantasyPoints: 78, injuryRisk: 'low', minutesPlayed: 400, yellowCards: 2, redCards: 0, keyPasses: 28, tacklesWon: 10, cleanSheets: 0 },
  { id: 'p9', name: 'Erling Haaland', country: 'Norway', position: 'ST', club: 'Manchester City', age: 25, goals: 0, assists: 0, rating: 7.0, marketValueM: 200, fantasyPoints: 0, injuryRisk: 'low', minutesPlayed: 0, yellowCards: 0, redCards: 0, keyPasses: 0, tacklesWon: 0, cleanSheets: 0 },
  { id: 'p10', name: 'Lamine Yamal', country: 'Spain', position: 'RW', club: 'Barcelona', age: 18, goals: 4, assists: 6, rating: 9.1, marketValueM: 120, fantasyPoints: 82, injuryRisk: 'low', minutesPlayed: 410, yellowCards: 0, redCards: 0, keyPasses: 24, tacklesWon: 3, cleanSheets: 0 },
  { id: 'p11', name: 'Ruben Dias', country: 'Portugal', position: 'CB', club: 'Manchester City', age: 28, goals: 1, assists: 0, rating: 8.6, marketValueM: 80, fantasyPoints: 65, injuryRisk: 'low', minutesPlayed: 450, yellowCards: 1, redCards: 0, keyPasses: 4, tacklesWon: 18, cleanSheets: 4 },
  { id: 'p12', name: 'Achraf Hakimi', country: 'Morocco', position: 'RB', club: 'PSG', age: 26, goals: 2, assists: 5, rating: 8.9, marketValueM: 85, fantasyPoints: 72, injuryRisk: 'low', minutesPlayed: 420, yellowCards: 1, redCards: 0, keyPasses: 14, tacklesWon: 16, cleanSheets: 3 },
  { id: 'p13', name: 'Rodri', country: 'Spain', position: 'CM', club: 'Manchester City', age: 29, goals: 1, assists: 3, rating: 8.9, marketValueM: 90, fantasyPoints: 68, injuryRisk: 'medium', minutesPlayed: 360, yellowCards: 2, redCards: 0, keyPasses: 20, tacklesWon: 22, cleanSheets: 0 },
  { id: 'p14', name: 'Alisson Becker', country: 'Brazil', position: 'GK', club: 'Liverpool', age: 33, goals: 0, assists: 0, rating: 8.7, marketValueM: 40, fantasyPoints: 60, injuryRisk: 'low', minutesPlayed: 450, yellowCards: 0, redCards: 0, keyPasses: 2, tacklesWon: 0, cleanSheets: 5 },
  { id: 'p15', name: 'Thibaut Courtois', country: 'Belgium', position: 'GK', club: 'Real Madrid', age: 33, goals: 0, assists: 0, rating: 8.8, marketValueM: 35, fantasyPoints: 62, injuryRisk: 'low', minutesPlayed: 450, yellowCards: 0, redCards: 0, keyPasses: 1, tacklesWon: 0, cleanSheets: 5 },
  { id: 'p16', name: 'Luka Modric', country: 'Croatia', position: 'CM', club: 'Real Madrid', age: 40, goals: 2, assists: 4, rating: 8.4, marketValueM: 12, fantasyPoints: 55, injuryRisk: 'medium', minutesPlayed: 320, yellowCards: 1, redCards: 0, keyPasses: 22, tacklesWon: 8, cleanSheets: 0 },
  { id: 'p17', name: 'Bukayo Saka', country: 'England', position: 'RW', club: 'Arsenal', age: 24, goals: 4, assists: 5, rating: 8.8, marketValueM: 130, fantasyPoints: 80, injuryRisk: 'low', minutesPlayed: 420, yellowCards: 0, redCards: 0, keyPasses: 18, tacklesWon: 6, cleanSheets: 0 },
  { id: 'p18', name: 'Mohamed Salah', country: 'Egypt', position: 'RW', club: 'Liverpool', age: 33, goals: 2, assists: 1, rating: 8.1, marketValueM: 45, fantasyPoints: 40, injuryRisk: 'medium', minutesPlayed: 270, yellowCards: 0, redCards: 0, keyPasses: 10, tacklesWon: 2, cleanSheets: 0 },
  { id: 'p19', name: 'Son Heung-min', country: 'South Korea', position: 'LW', club: 'Tottenham', age: 33, goals: 3, assists: 2, rating: 8.3, marketValueM: 35, fantasyPoints: 48, injuryRisk: 'low', minutesPlayed: 360, yellowCards: 0, redCards: 0, keyPasses: 12, tacklesWon: 3, cleanSheets: 0 },
  { id: 'p20', name: 'Dusan Vlahovic', country: 'Serbia', position: 'ST', club: 'Juventus', age: 26, goals: 3, assists: 1, rating: 8.0, marketValueM: 75, fantasyPoints: 50, injuryRisk: 'low', minutesPlayed: 350, yellowCards: 2, redCards: 0, keyPasses: 6, tacklesWon: 2, cleanSheets: 0 },
  { id: 'p21', name: 'Memphis Depay', country: 'Netherlands', position: 'ST', club: 'Atletico Madrid', age: 31, goals: 2, assists: 2, rating: 7.8, marketValueM: 25, fantasyPoints: 38, injuryRisk: 'medium', minutesPlayed: 300, yellowCards: 1, redCards: 0, keyPasses: 9, tacklesWon: 2, cleanSheets: 0 },
  { id: 'p22', name: 'Takumi Minamino', country: 'Japan', position: 'AM', club: 'Monaco', age: 30, goals: 2, assists: 3, rating: 7.9, marketValueM: 20, fantasyPoints: 42, injuryRisk: 'low', minutesPlayed: 340, yellowCards: 0, redCards: 0, keyPasses: 11, tacklesWon: 7, cleanSheets: 0 },
  { id: 'p23', name: 'Sofyan Amrabat', country: 'Morocco', position: 'CM', club: 'Fiorentina', age: 29, goals: 0, assists: 1, rating: 8.2, marketValueM: 22, fantasyPoints: 44, injuryRisk: 'low', minutesPlayed: 420, yellowCards: 3, redCards: 0, keyPasses: 8, tacklesWon: 25, cleanSheets: 0 },
  { id: 'p24', name: 'Victor Osimhen', country: 'Nigeria', position: 'ST', club: 'Galatasaray', age: 27, goals: 2, assists: 0, rating: 8.1, marketValueM: 65, fantasyPoints: 46, injuryRisk: 'medium', minutesPlayed: 310, yellowCards: 1, redCards: 0, keyPasses: 5, tacklesWon: 3, cleanSheets: 0 },
  { id: 'p25', name: 'Kevin De Bruyne', country: 'Belgium', position: 'CM', club: 'Manchester City', age: 34, goals: 1, assists: 6, rating: 8.9, marketValueM: 40, fantasyPoints: 72, injuryRisk: 'high', minutesPlayed: 280, yellowCards: 0, redCards: 0, keyPasses: 28, tacklesWon: 5, cleanSheets: 0 },
  { id: 'p26', name: 'Marquinhos', country: 'Brazil', position: 'CB', club: 'PSG', age: 31, goals: 1, assists: 0, rating: 8.5, marketValueM: 55, fantasyPoints: 62, injuryRisk: 'low', minutesPlayed: 450, yellowCards: 1, redCards: 0, keyPasses: 5, tacklesWon: 20, cleanSheets: 5 },
  { id: 'p27', name: 'Virgil van Dijk', country: 'Netherlands', position: 'CB', club: 'Liverpool', age: 34, goals: 1, assists: 0, rating: 8.4, marketValueM: 35, fantasyPoints: 58, injuryRisk: 'low', minutesPlayed: 450, yellowCards: 1, redCards: 0, keyPasses: 4, tacklesWon: 22, cleanSheets: 4 },
  { id: 'p28', name: 'Julian Alvarez', country: 'Argentina', position: 'ST', club: 'Atletico Madrid', age: 25, goals: 4, assists: 2, rating: 8.6, marketValueM: 90, fantasyPoints: 74, injuryRisk: 'low', minutesPlayed: 380, yellowCards: 0, redCards: 0, keyPasses: 10, tacklesWon: 4, cleanSheets: 0 },
  { id: 'p29', name: 'Bruno Fernandes', country: 'Portugal', position: 'AM', club: 'Manchester United', age: 31, goals: 3, assists: 4, rating: 8.3, marketValueM: 60, fantasyPoints: 62, injuryRisk: 'low', minutesPlayed: 390, yellowCards: 2, redCards: 0, keyPasses: 20, tacklesWon: 6, cleanSheets: 0 },
  { id: 'p30', name: 'Sadio Mane', country: 'Senegal', position: 'ST', club: 'Al-Nassr', age: 33, goals: 2, assists: 1, rating: 7.9, marketValueM: 18, fantasyPoints: 38, injuryRisk: 'medium', minutesPlayed: 300, yellowCards: 0, redCards: 0, keyPasses: 8, tacklesWon: 3, cleanSheets: 0 },
];

export const MATCHES: Match[] = [
  { id: 'm1', group: 'A', home: 'USA', away: 'MEX', date: '2026-06-11T16:00:00Z', venue: 'MetLife Stadium, New York', homeGoals: 2, awayGoals: 0, homeProbWin: 0.55, drawProb: 0.25, awayProbWin: 0.20 },
  { id: 'm2', group: 'A', home: 'CAN', away: 'POL', date: '2026-06-12T14:00:00Z', venue: 'BC Place, Vancouver', homeGoals: 1, awayGoals: 1, homeProbWin: 0.40, drawProb: 0.30, awayProbWin: 0.30 },
  { id: 'm3', group: 'A', home: 'USA', away: 'POL', date: '2026-06-16T14:00:00Z', venue: 'AT&T Stadium, Dallas', homeGoals: 3, awayGoals: 1, homeProbWin: 0.62, drawProb: 0.20, awayProbWin: 0.18 },
  { id: 'm4', group: 'A', home: 'MEX', away: 'CAN', date: '2026-06-17T18:00:00Z', venue: 'Azteca Stadium, Mexico City', homeGoals: null, awayGoals: null, homeProbWin: 0.45, drawProb: 0.28, awayProbWin: 0.27 },
  { id: 'm5', group: 'A', home: 'POL', away: 'MEX', date: '2026-06-21T14:00:00Z', venue: 'Empower Field, Denver', homeGoals: null, awayGoals: null, homeProbWin: 0.38, drawProb: 0.28, awayProbWin: 0.34 },
  { id: 'm6', group: 'A', home: 'CAN', away: 'USA', date: '2026-06-21T14:00:00Z', venue: 'BC Place, Vancouver', homeGoals: null, awayGoals: null, homeProbWin: 0.30, drawProb: 0.28, awayProbWin: 0.42 },

  { id: 'm7', group: 'B', home: 'BRA', away: 'GER', date: '2026-06-13T18:00:00Z', venue: 'SoFi Stadium, Los Angeles', homeGoals: 3, awayGoals: 1, homeProbWin: 0.60, drawProb: 0.20, awayProbWin: 0.20 },
  { id: 'm8', group: 'B', home: 'ARG', away: 'FRA', date: '2026-06-14T21:00:00Z', venue: 'Hard Rock Stadium, Miami', homeGoals: 2, awayGoals: 2, homeProbWin: 0.40, drawProb: 0.30, awayProbWin: 0.30 },
  { id: 'm9', group: 'B', home: 'BRA', away: 'ARG', date: '2026-06-18T21:00:00Z', venue: 'Rose Bowl, Los Angeles', homeGoals: null, awayGoals: null, homeProbWin: 0.42, drawProb: 0.28, awayProbWin: 0.30 },
  { id: 'm10', group: 'B', home: 'FRA', away: 'GER', date: '2026-06-19T18:00:00Z', venue: 'Levi\'s Stadium, San Jose', homeGoals: null, awayGoals: null, homeProbWin: 0.50, drawProb: 0.25, awayProbWin: 0.25 },
  { id: 'm11', group: 'B', home: 'GER', away: 'ARG', date: '2026-06-22T14:00:00Z', venue: 'Arrowhead Stadium, Kansas City', homeGoals: null, awayGoals: null, homeProbWin: 0.35, drawProb: 0.28, awayProbWin: 0.37 },
  { id: 'm12', group: 'B', home: 'FRA', away: 'BRA', date: '2026-06-22T14:00:00Z', venue: 'Mercedes-Benz Stadium, Atlanta', homeGoals: null, awayGoals: null, homeProbWin: 0.38, drawProb: 0.27, awayProbWin: 0.35 },

  { id: 'm13', group: 'C', home: 'ENG', away: 'NED', date: '2026-06-14T16:00:00Z', venue: 'Gillette Stadium, Boston', homeGoals: 2, awayGoals: 1, homeProbWin: 0.52, drawProb: 0.25, awayProbWin: 0.23 },
  { id: 'm14', group: 'C', home: 'ESP', away: 'POR', date: '2026-06-15T20:00:00Z', venue: 'MetLife Stadium, New York', homeGoals: 1, awayGoals: 0, homeProbWin: 0.48, drawProb: 0.27, awayProbWin: 0.25 },
  { id: 'm15', group: 'C', home: 'ENG', away: 'POR', date: '2026-06-19T14:00:00Z', venue: 'Levi\'s Stadium, San Jose', homeGoals: null, awayGoals: null, homeProbWin: 0.45, drawProb: 0.28, awayProbWin: 0.27 },
  { id: 'm16', group: 'C', home: 'ESP', away: 'NED', date: '2026-06-20T21:00:00Z', venue: 'SoFi Stadium, Los Angeles', homeGoals: null, awayGoals: null, homeProbWin: 0.55, drawProb: 0.25, awayProbWin: 0.20 },
];

export const SIMULATION: SimResult[] = [
  { team: 'Brazil', flag: '🇧🇷', r16Pct: 98, qfPct: 75, sfPct: 50, finalPct: 30, winPct: 15.2 },
  { team: 'France', flag: '🇫🇷', r16Pct: 95, qfPct: 70, sfPct: 45, finalPct: 28, winPct: 13.8 },
  { team: 'Argentina', flag: '🇦🇷', r16Pct: 94, qfPct: 68, sfPct: 42, finalPct: 25, winPct: 14.1 },
  { team: 'Spain', flag: '🇪🇸', r16Pct: 93, qfPct: 65, sfPct: 40, finalPct: 22, winPct: 11.5 },
  { team: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', r16Pct: 90, qfPct: 58, sfPct: 35, finalPct: 18, winPct: 9.2 },
  { team: 'Germany', flag: '🇩🇪', r16Pct: 85, qfPct: 50, sfPct: 30, finalPct: 15, winPct: 8.5 },
  { team: 'Portugal', flag: '🇵🇹', r16Pct: 82, qfPct: 45, sfPct: 25, finalPct: 12, winPct: 7.3 },
  { team: 'Netherlands', flag: '🇳🇱', r16Pct: 76, qfPct: 38, sfPct: 18, finalPct: 8, winPct: 5.1 },
  { team: 'Belgium', flag: '🇧🇪', r16Pct: 78, qfPct: 40, sfPct: 20, finalPct: 9, winPct: 5.8 },
  { team: 'Croatia', flag: '🇭🇷', r16Pct: 72, qfPct: 32, sfPct: 15, finalPct: 6, winPct: 3.6 },
  { team: 'Morocco', flag: '🇲🇦', r16Pct: 70, qfPct: 30, sfPct: 13, finalPct: 5, winPct: 3.8 },
  { team: 'USA', flag: '🇺🇸', r16Pct: 70, qfPct: 35, sfPct: 15, finalPct: 5, winPct: 4.5 },
  { team: 'Uruguay', flag: '🇺🇾', r16Pct: 68, qfPct: 28, sfPct: 12, finalPct: 4, winPct: 4.1 },
  { team: 'Mexico', flag: '🇲🇽', r16Pct: 60, qfPct: 22, sfPct: 8, finalPct: 3, winPct: 2.1 },
  { team: 'Japan', flag: '🇯🇵', r16Pct: 65, qfPct: 25, sfPct: 10, finalPct: 3, winPct: 2.9 },
  { team: 'Colombia', flag: '🇨🇴', r16Pct: 58, qfPct: 20, sfPct: 7, finalPct: 2, winPct: 2.0 },
  { team: 'Denmark', flag: '🇩🇰', r16Pct: 55, qfPct: 18, sfPct: 6, finalPct: 2, winPct: 2.2 },
  { team: 'Senegal', flag: '🇸🇳', r16Pct: 52, qfPct: 15, sfPct: 5, finalPct: 2, winPct: 1.9 },
  { team: 'Mexico', flag: '🇲🇽', r16Pct: 60, qfPct: 22, sfPct: 8, finalPct: 3, winPct: 2.1 },
  { team: 'South Korea', flag: '🇰🇷', r16Pct: 55, qfPct: 18, sfPct: 6, finalPct: 2, winPct: 1.5 },
];

export const TOP_SCORERS = [
  { playerName: 'Kylian Mbappe', country: 'France', flag: '🇫🇷', goals: 8, assists: 2, minutesPlayed: 450 },
  { playerName: 'Jude Bellingham', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals: 6, assists: 3, minutesPlayed: 450 },
  { playerName: 'Vinicius Jr', country: 'Brazil', flag: '🇧🇷', goals: 5, assists: 3, minutesPlayed: 400 },
  { playerName: 'Lamine Yamal', country: 'Spain', flag: '🇪🇸', goals: 4, assists: 6, minutesPlayed: 410 },
  { playerName: 'Jamal Musiala', country: 'Germany', flag: '🇩🇪', goals: 4, assists: 4, minutesPlayed: 380 },
  { playerName: 'Pedri', country: 'Spain', flag: '🇪🇸', goals: 3, assists: 5, minutesPlayed: 400 },
  { playerName: 'Christian Pulisic', country: 'USA', flag: '🇺🇸', goals: 3, assists: 2, minutesPlayed: 360 },
  { playerName: 'Julian Alvarez', country: 'Argentina', flag: '🇦🇷', goals: 4, assists: 2, minutesPlayed: 380 },
  { playerName: 'Bukayo Saka', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', goals: 4, assists: 5, minutesPlayed: 420 },
  { playerName: 'Victor Osimhen', country: 'Nigeria', flag: '🇳🇬', goals: 2, assists: 0, minutesPlayed: 310 },
];

export const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
export const CONFEDERATIONS = ['UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC'];
export const POSITIONS = ['GK', 'CB', 'RB', 'LB', 'CM', 'AM', 'LW', 'RW', 'ST'];

export function getTeamByCode(code: string): Team | undefined {
  return TEAMS.find(t => t.id === code);
}

export function getTeamsByGroup(group: string): Team[] {
  return TEAMS.filter(t => t.group === group).sort((a, b) => b.projectedPoints - a.projectedPoints);
}

export function getMatchesByGroup(group: string): Match[] {
  return MATCHES.filter(m => m.group === group);
}

export function getPlayersByCountry(country: string): Player[] {
  return PLAYERS.filter(p => p.country === country);
}
