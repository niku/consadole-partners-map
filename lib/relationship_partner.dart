class RelationshipPartner {
  final int id;
  final String name;
  final String furigana;
  final String category;
  final String region;
  final String rank;
  final String startDate;
  final String work;
  final String postalCode;
  final String address;
  final String phoneNumber;
  final String url;
  final String benefit;
  final String comment;
  final int isActive;
  final String createdAt;
  final String updatedAt;
  final int updatedBy;
  final int continuationYears;

  RelationshipPartner({
    required this.id,
    required this.name,
    required this.furigana,
    required this.category,
    required this.region,
    required this.rank,
    required this.startDate,
    required this.work,
    required this.postalCode,
    required this.address,
    required this.phoneNumber,
    required this.url,
    required this.benefit,
    required this.comment,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
    required this.updatedBy,
    required this.continuationYears,
  });
}
