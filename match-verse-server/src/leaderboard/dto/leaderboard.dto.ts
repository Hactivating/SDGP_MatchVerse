export class LeaderboardDto {
    id: number;
    username: string; 

  
    constructor(user: { id: number; username: string; score: number }) {
      this.id = user.id;
      this.username = user.username;
    }
  }