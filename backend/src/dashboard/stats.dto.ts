export class StatsDto {
  activeClubs: { name: string; members: number }[];
  archivedClubs: { name: string; members: number }[];
  activeSports: { nom: string; participations: number }[];
  archivedSports: { nom: string; participations: number }[];
  inscriptionsByActiveClubType: { name: string; inscriptions: number }[];
  inscriptionsByArchivedClubType: { name: string; inscriptions: number }[];
  inscriptionsByActiveSportType: { name: string; inscriptions: number }[];
  inscriptionsByArchivedSportType: { name: string; inscriptions: number }[];
  inscriptionsByBeneficiaryClub: {
    beneficiary: string;
    inscriptions: number;
  }[];
  inscriptionsByBeneficiarySport: {
    beneficiary: string;
    inscriptions: number;
  }[];
  reviewsByEvent: {
    eventName: string;
    eventId: number;
    reviewCount: number;
    positive: number;
    neutral: number;
    negative: number;
  }[];
  events: { name: string; inscriptions: number }[];
}
