export interface CodeFile {
  name: string;
  language: string;
  path: string;
  description: string;
  content: string;
}

export const FLUTTER_FILES: CodeFile[] = [
  {
    name: "pubspec.yaml",
    language: "yaml",
    path: "pubspec.yaml",
    description: "Android & iOS core dependencies including Firebase Suite and Google Mobile Ads SDK.",
    content: `name: adquest_reward_app
description: A production-ready Flutter Rewarded Ads & Referrals App.
version: 1.0.0+1

environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter

  # Core Backend Security & Data
  firebase_core: ^2.24.0
  firebase_auth: ^4.15.0
  cloud_firestore: ^4.13.0

  # AdMob Monetization
  google_mobile_ads: ^4.0.0

  # Utilities
  provider: ^6.1.1
  lucide_icons: ^0.320.0 # Modern layout iconography

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
`
  },
  {
    name: "main.dart",
    language: "dart",
    path: "lib/main.dart",
    description: "App entry point initializing Mobile Ads globally, setting up Firebase, and material routing.",
    content: `import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:provider/provider.dart';

import 'services/auth_service.dart';
import 'services/ad_service.dart';
import 'screens/login_screen.dart';
import 'screens/main_navigation.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // 1. Initialize Firebase Services
  await Firebase.initializeApp();
  
  // 2. Initialize Google Mobile Ads SDK
  await MobileAds.instance.initialize();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()),
        ChangeNotifierProvider(create: (_) => AdService()),
      ],
      child: const AdQuestApp(),
    ),
  );
}

class AdQuestApp extends StatelessWidget {
  const AdQuestApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AdQuest Rewards',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        fontFamily: 'Inter',
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366F1),
          brightness: Brightness.light,
          primary: const Color(0xFF6366F1),
          secondary: const Color(0xFF10B981),
          background: const Color(0xFFF9FAFB),
        ),
      ),
      home: const AuthWrapper(),
    );
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    
    // Check if user is signed in
    if (authService.currentUser != null) {
      return const MainNavigationScreen();
    }
    return const LoginScreen();
  }
}
`
  },
  {
    name: "user_model.dart",
    language: "dart",
    path: "lib/models/user_model.dart",
    description: "The database model object supporting serializations with exact matching specifications from the NoSQL schema.",
    content: `class UserModel {
  final String uid;
  final String name;
  final String email;
  final int pointsBalance;
  final int lifetimeAdsWatched;
  final String myReferralCode;
  final String referredBy;

  UserModel({
    required this.uid,
    required this.name,
    required this.email,
    required this.pointsBalance,
    required this.lifetimeAdsWatched,
    required this.myReferralCode,
    required this.referredBy,
  });

  // Convert Firestore document snapshot to UserModel
  factory UserModel.fromMap(Map<String, dynamic> data, String id) {
    return UserModel(
      uid: id,
      name: data['name'] ?? '',
      email: data['email'] ?? '',
      pointsBalance: data['pointsBalance'] ?? 0,
      lifetimeAdsWatched: data['lifetimeAdsWatched'] ?? 0,
      myReferralCode: data['myReferralCode'] ?? '',
      referredBy: data['referredBy'] ?? 'none',
    );
  }

  // Convert UserModel back to JSON Map representation for Firestore document writes
  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'name': name,
      'email': email,
      'pointsBalance': pointsBalance,
      'lifetimeAdsWatched': lifetimeAdsWatched,
      'myReferralCode': myReferralCode,
      'referredBy': referredBy,
    };
  }
}
`
  },
  {
    name: "auth_service.dart",
    language: "dart",
    path: "lib/services/auth_service.dart",
    description: "Firebase Auth sign-in and automated profile generator mapping zeroed values and custom referral codes.",
    content: `import 'dart:math';
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/user_model.dart';

class AuthService extends ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  User? get currentUser => _auth.currentUser;

  // Stream updates for active sessions
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  // Create registration session & run pipeline for user registration
  Future<UserCredential?> signUpWithEmail({
    required String name,
    required String email,
    required String password,
  }) async {
    try {
      // 1. Firebase Authentication credential generation
      UserCredential credential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      final uid = credential.user!.uid;

      // 2. Generate referral code: first 3 letters of name + 4 random digits
      String codePrefix = name.trim().replaceAll(' ', '');
      if (codePrefix.length < 3) {
        codePrefix = (codePrefix + 'AAA').substring(0, 3);
      } else {
        codePrefix = codePrefix.substring(0, 3);
      }
      codePrefix = codePrefix.toUpperCase();

      final Random rand = Random();
      final String randomDigits = (1000 + rand.nextInt(9000)).toString();
      final String uniqueCode = '$codePrefix$randomDigits';

      // 3. Create schema document mapping specified zeroed properties
      UserModel userModel = UserModel(
        uid: uid,
        name: name,
        email: email,
        pointsBalance: 0,
        lifetimeAdsWatched: 0,
        myReferralCode: uniqueCode,
        referredBy: 'none',
      );

      // Writes secure zeroed profile directly into Firestore
      await _db.collection('users').doc(uid).set(userModel.toMap());
      
      notifyListeners();
      return credential;
    } catch (e) {
      rethrow;
    }
  }

  // Basic Session Login
  Future<UserCredential?> signInWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      UserCredential userCredential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      notifyListeners();
      return userCredential;
    } catch (e) {
      rethrow;
    }
  }

  // Logout session
  Future<void> signOut() async {
    await _auth.signOut();
    notifyListeners();
  }
}
`
  },
  {
    name: "ad_service.dart",
    language: "dart",
    path: "lib/services/ad_service.dart",
    description: "Handles integration of AdMob Rewarded Interstitial SDK with the userEarnedReward triggers to increment Firestore.",
    content: `import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class AdService extends ChangeNotifier {
  RewardedAd? _rewardedAd;
  bool _isAdLoading = false;

  bool get isAdLoading => _isAdLoading;

  // Set testing ID provided offical by Google AdMob documentation
  // iOS Test Ad ID: ca-app-pub-3940256099942544/1712485313
  // Android Test Ad ID: ca-app-pub-3940256099942544/5224354917
  final String _adUnitId = 'ca-app-pub-3940256099942544/5224354917';

  // Pre-load the ad so it is ready immediately when requested
  void loadRewardedAd() {
    _isAdLoading = true;
    notifyListeners();

    RewardedAd.load(
      adUnitId: _adUnitId,
      request: const AdRequest(),
      rewardedAdLoadCallback: RewardedAdLoadCallback(
        onAdLoaded: (ad) {
          _rewardedAd = ad;
          _isAdLoading = false;
          notifyListeners();
        },
        onAdFailedToLoad: (error) {
          _rewardedAd = null;
          _isAdLoading = false;
          notifyListeners();
          debugPrint('Rewarded ad failed to load: $error');
        },
      ),
    );
  }

  // Displays the Rewarded Interstitial overlay, applying Firestore transactional point awarding
  void showRewardedAd({
    required Function(int earnedAmount) onRewardEarned,
    required VoidCallback onFailed,
  }) {
    if (_rewardedAd == null) {
      onFailed();
      loadRewardedAd(); // Queue next load
      return;
    }

    _rewardedAd!.fullScreenContentCallback = FullScreenContentCallback(
      onAdDismissedFullScreenContent: (ad) {
        ad.dispose();
        loadRewardedAd(); // Auto-queue next video ad
      },
      onAdFailedToShowFullScreenContent: (ad, error) {
        ad.dispose();
        loadRewardedAd();
        onFailed();
      },
    );

    // CRITICAL: Present overlay in viewport and process the reward callback stream securely
    _rewardedAd!.show(
      onUserEarnedReward: (AdWithoutView ad, RewardItem reward) async {
        final int earnedPoints = 5; // Configured reward increment
        await _awardRewardToUser(earnedPoints);
        onRewardEarned(earnedPoints);
      },
    );
    _rewardedAd = null; // Clear active ad reference
  }

  // Update backend stats securely following validated AdMob callback confirmation
  Future<void> _awardRewardToUser(int points) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    final userRef = FirebaseFirestore.instance.collection('users').doc(user.uid);

    // Execute atomic transaction incrementing points and watch tallies
    await FirebaseFirestore.instance.runTransaction((transaction) async {
      DocumentSnapshot snapshot = await transaction.get(userRef);
      if (!snapshot.exists) return;

      int currentBalance = snapshot.get('pointsBalance') ?? 0;
      int currentAdsWatched = snapshot.get('lifetimeAdsWatched') ?? 0;

      transaction.update(userRef, {
        'pointsBalance': currentBalance + points,
        'lifetimeAdsWatched': currentAdsWatched + 1,
      });
    });
  }

  @override
  void dispose() {
    _rewardedAd?.dispose();
    super.dispose();
  }
}
`
  },
  {
    name: "referral_service.dart",
    language: "dart",
    path: "lib/services/referral_service.dart",
    description: "Executes the multi-document Firestore transaction verify double-incentivized loops and logging audit trails.",
    content: `import 'package:flutter/foundation.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class ReferralService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  // Main code submit transaction
  Future<void> redeemReferralCode(String promoCode) async {
    final String cleanCode = promoCode.trim().toUpperCase();
    final User? currentUser = _auth.currentUser;

    if (currentUser == null) {
      throw Exception('Session authorization missing. Please log in.');
    }

    final String selfUid = currentUser.uid;
    final DocumentReference selfDocRef = _db.collection('users').doc(selfUid);

    // SECURE FIRESTORE TRANSACTION LOOP COVERS THE SPECIFIED STATED CRITERIA
    await _db.runTransaction((transaction) async {
      // 1. Fetch current user document
      DocumentSnapshot selfSnapshot = await transaction.get(selfDocRef);
      if (!selfSnapshot.exists) {
        throw Exception('User profile does not exist in backend.');
      }

      // Criterion 1: Verify referredBy strictly equals 'none'
      String referredBy = selfSnapshot.get('referredBy') ?? 'none';
      if (referredBy != 'none') {
        throw Exception('You have already applied a referral code.');
      }

      // 2. Query target partner document owning the matching 'myReferralCode'
      QuerySnapshot matchQuery = await _db
          .collection('users')
          .where('myReferralCode', isEqualTo: cleanCode)
          .limit(1)
          .get();

      if (matchQuery.docs.isEmpty) {
        throw Exception('Invalid invite code. Try checking for typos.');
      }

      DocumentSnapshot partnerSnapshot = matchQuery.docs.first;
      final String partnerUid = partnerSnapshot.id;

      // Criterion 3: Ensure code owner's UID does not match current user's UID (no self-referral)
      if (partnerUid == selfUid) {
        throw Exception('Self-referrals are not permitted.');
      }

      // 3. Atomically write operations: Update self, update partner, insert audit log
      final DocumentReference partnerDocRef = _db.collection('users').doc(partnerUid);
      final DocumentReference referralAuditRef = _db.collection('referrals').doc();

      int selfPoints = selfSnapshot.get('pointsBalance') ?? 0;
      int partnerPoints = partnerSnapshot.get('pointsBalance') ?? 0;

      // Write 1: Update current user's points & referredBy
      transaction.update(selfDocRef, {
        'pointsBalance': selfPoints + 100,
        'referredBy': partnerUid,
      });

      // Write 2: Add reward points to the owner of referral code (partner)
      transaction.update(partnerDocRef, {
        'pointsBalance': partnerPoints + 100,
      });

      // Write 3: Write audit entry for records integrity and logging
      transaction.set(referralAuditRef, {
        'referrerUid': partnerUid,
        'referredUid': selfUid,
        'pointsAwarded': 100,
        'timestamp': FieldValue.serverTimestamp(),
      });
    });
  }
}
`
  },
  {
    name: "storefront_screen.dart",
    language: "dart",
    path: "lib/screens/storefront_screen.dart",
    description: "Responsive 2-column GridView marketplace. Evaluates point thresholds in real-time, locking out buttons and driving transactions.",
    content: `import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../services/ad_service.dart';

class StorefrontScreen extends StatefulWidget {
  const StorefrontScreen({super.key});

  @override
  State<StorefrontScreen> createState() => _StorefrontScreenState();
}

class _StorefrontScreenState extends State<StorefrontScreen> {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  final String _currentUid = FirebaseAuth.instance.currentUser?.uid ?? '';

  @override
  void initState() {
    super.initState();
    // Cache ads so user doesn't wait when they press Watch
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<AdService>(context, listen: false).loadRewardedAd();
    });
  }

  // Trigger secure purchase deducting item values with active database validation
  Future<void> _redeemItem(BuildContext context, String itemId, String title, int cost) async {
    if (_currentUid.isEmpty) return;
    
    final userRef = _db.collection('users').doc(_currentUid);

    try {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => const Center(child: CircularProgressIndicator()),
      );

      await _db.runTransaction((transaction) async {
        DocumentSnapshot userSnap = await transaction.get(userRef);
        if (!userSnap.exists) throw Exception("User profile not found.");

        int currentBalance = userSnap.get('pointsBalance') ?? 0;
        if (currentBalance < cost) {
          throw Exception("Insufficient balance to unlock this item.");
        }

        // Deduct points
        transaction.update(userRef, {
          'pointsBalance': currentBalance - cost,
        });

        // Insert purchase audit transaction document
        final purchaseRef = _db.collection('purchases').doc();
         transaction.set(purchaseRef, {
          'uid': _currentUid,
          'itemId': itemId,
          'title': title,
          'pointsCost': cost,
          'timestamp': FieldValue.serverTimestamp(),
        });
      });

      if (!mounted) return;
      Navigator.pop(context); // Close loading indicator

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Successfully redeemed: $title! Code will be emailed.'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      Navigator.pop(context); // Close loading indicator
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final adService = Provider.of<AdService>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Rewards Center', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          // Stream User balance directly in App bar for immediate responsive update
          StreamBuilder<DocumentSnapshot>(
            stream: _db.collection('users').doc(_currentUid).snapshots(),
            builder: (context, snapshot) {
              int balance = 0;
              if (snapshot.hasData && snapshot.data!.exists) {
                balance = snapshot.data!.get('pointsBalance') ?? 0;
              }

              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF6366F1), Color(0xFF4F46E5)],
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF6366F1).withOpacity(0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 3)
                    )
                  ]
                ),
                child: Row(
                  children: [
                    const Icon(LucideIcons.coins, color: Colors.amber, size: 16),
                    const SizedBox(width: 6),
                    Text(
                      '$balance Pts',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              );
            },
          )
        ],
      ),
      body: StreamBuilder<DocumentSnapshot>(
        stream: _db.collection('users').doc(_currentUid).snapshots(),
        builder: (context, userSnapshot) {
          int pointsBalance = 0;
          if (userSnapshot.hasData && userSnapshot.data!.exists) {
            pointsBalance = userSnapshot.data!.get('pointsBalance') ?? 0;
          }

          return SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Ad Trigger Banner
                Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(color: Colors.grey.shade200),
                  ),
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      gradient: LinearGradient(
                        colors: [Colors.purple.shade50, Colors.indigo.shade50],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                    padding: const EdgeInsets.all(20.0),
                    child: Column(
                      children: [
                        const Icon(LucideIcons.playCircle, size: 48, color: Color(0xFF6366F1)),
                        const SizedBox(height: 12),
                        const Text(
                          'Need More Points?',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1E1B4B)),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Watch a short video sponsor to earn +5 points instantly!',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 13, color: Colors.indigo.shade900),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: adService.isAdLoading
                              ? null
                              : () {
                                  adService.showRewardedAd(
                                    onRewardEarned: (earned) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(
                                          content: Text('Sponsor finished! Received +5 Points!'),
                                          backgroundColor: Colors.amber,
                                        ),
                                      );
                                    },
                                    onFailed: () {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(
                                          content: Text('Video ad could not be loaded. Try again in a bit.'),
                                          backgroundColor: Colors.red,
                                        ),
                                      );
                                    },
                                  );
                                },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF6366F1),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                            elevation: 0,
                          ),
                          icon: adService.isAdLoading
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                )
                              : const Icon(LucideIcons.video, size: 18),
                          label: Text(adService.isAdLoading ? 'Buffering Ad...' : 'Watch Video (+5 Points)'),
                        ),
                      ],
                    ),
                  ),
                ),
                
                const SizedBox(height: 24),
                const Text(
                  'Exclusive Inventory Marketplace',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black80),
                ),
                const SizedBox(height: 12),

                // 2-Column Marketplace Grid StreamBuilder querying the '/store' inventory
                StreamBuilder<QuerySnapshot>(
                  stream: _db.collection('store').snapshots(),
                  builder: (context, storeSnapshot) {
                    if (storeSnapshot.connectionState == ConnectionState.waiting) {
                      return const Center(child: CircularProgressIndicator());
                    }

                    // Default local fallback options if Firestore hasn't seeded inventory yet
                    final docs = storeSnapshot.hasData ? storeSnapshot.data!.docs : [];
                    if (docs.isEmpty) {
                      return GridView.count(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisCount: 2,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                        childAspectRatio: 0.8,
                        children: [
                          _buildDefaultStoreCard('neon_theme', 'Neon Dark Theme', 500, 'Customizer', LucideIcons.palette, pointsBalance),
                          _buildDefaultStoreCard('amazon_5', '\$5 Amazon Voucher', 10000, 'E-Voucher', LucideIcons.gift, pointsBalance),
                          _buildDefaultStoreCard('play_10', '\$10 Play Store Card', 20000, 'Credit', LucideIcons.gamepad2, pointsBalance),
                        ],
                      );
                    }

                    return GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                        childAspectRatio: 0.8,
                      ),
                      itemCount: docs.length,
                      itemBuilder: (context, index) {
                        final data = docs[index].data() as Map<String, dynamic>;
                        final itemId = data['itemId'] ?? '';
                        final title = data['title'] ?? 'Generic Item';
                        final cost = data['pointsCost'] ?? 100;
                        final category = data['category'] ?? 'Item';
                        final isLocked = pointsBalance < cost;

                        return Card(
                          color: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: BorderSide(color: Colors.grey.shade200),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(12.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.grey.shade100,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    category,
                                    style: TextStyle(fontSize: 10, color: Colors.grey.shade600, fontWeight: FontWeight.bold),
                                  ),
                                ),
                                const Spacer(),
                                const Center(
                                  child: Icon(LucideIcons.package, size: 48, color: Colors.amber),
                                ),
                                const Spacer(),
                                Text(
                                  title,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '$cost Points',
                                  style: const TextStyle(color: Color(0xFF4F46E5), fontSize: 13, fontWeight: FontWeight.w600),
                                ),
                                const SizedBox(height: 10),
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton(
                                    onPressed: isLocked
                                        ? null
                                        : () => _redeemItem(context, itemId, title, cost),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF10B981),
                                      disabledBackgroundColor: Colors.grey.shade200,
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(vertical: 8),
                                      elevation: 0,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                    ),
                                    child: Text(isLocked ? 'Locked' : 'Redeem'),
                                  ),
                                )
                              ],
                            ),
                          ),
                        );
                      },
                    );
                  },
                )
              ],
            ),
          );
        },
      ),
    );
  }

  // Fallback visual UI compiler if the online DB '/store' is empty during test
  Widget _buildDefaultStoreCard(String itemId, String title, int cost, String cat, IconData iconCode, int userBalance) {
    final bool isLocked = userBalance < cost;

    return Card(
      color: Colors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                cat,
                style: TextStyle(fontSize: 10, color: Colors.grey.shade600, fontWeight: FontWeight.bold),
              ),
            ),
            const Spacer(),
            Center(
              child: Icon(iconCode, size: 48, color: isLocked ? Colors.grey : const Color(0xFF6366F1)),
            ),
            const Spacer(),
            Text(
              title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
            const SizedBox(height: 4),
            Text(
              '$cost Pts',
              style: TextStyle(color: isLocked ? Colors.grey : const Color(0xFF4F46E5), fontSize: 12, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: isLocked
                    ? null
                    : () => _redeemItem(context, itemId, title, cost),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  disabledBackgroundColor: Colors.grey.shade200,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  elevation: 0,
                ),
                child: Text(isLocked ? 'Locked' : 'Redeem'),
              ),
            )
          ],
        ),
      ),
    );
  }
}
`
  }
];
