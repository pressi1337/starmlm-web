import User from '../models/User.js';
import ReferralSetting from '../models/ReferralSetting.js';
import Earning from '../models/Earning.js';

class ReferralService {
  async processReferralBonus(newUserId) {
    try {
      const newUser = await User.findById(newUserId);
      
      if (!newUser.referredBy) {
        return { success: false, message: 'No referrer found' };
      }

      const referrer = await User.findById(newUser.referredBy);
      if (!referrer) {
        return { success: false, message: 'Referrer not found' };
      }

      // Get referral settings for referrer's level
      const settings = await ReferralSetting.findOne({ 
        level: referrer.role,
        isActive: true 
      });

      if (!settings) {
        return { success: false, message: 'No referral settings found' };
      }

      // Find applicable range
      const applicableRange = settings.ranges.find(range => 
        referrer.totalReferrals >= range.from && referrer.totalReferrals <= range.to
      );

      if (!applicableRange) {
        return { success: false, message: 'No applicable referral range found' };
      }

      // Award bonus
      referrer.earnings.scratch += applicableRange.amount;
      await referrer.save();

      // Record earning
      await Earning.create({
        userId: referrer._id,
        type: 'referral',
        amount: applicableRange.amount,
        wallet: 'scratch',
        description: `Referral Bonus - ${newUser.username} joined`,
        relatedId: newUser._id,
        relatedType: 'User'
      });

      return { 
        success: true, 
        bonusAmount: applicableRange.amount,
        referrerUsername: referrer.username
      };
    } catch (error) {
      console.error('Error processing referral bonus:', error);
      return { success: false, message: 'Error processing referral bonus' };
    }
  }

  async getReferralTree(userId, depth = 0, maxDepth = 3) {
    if (depth >= maxDepth) return [];
    
    const referrals = await User.find({ referredBy: userId })
      .select('username mobile level earnings isActive createdAt totalReferrals')
      .sort({ createdAt: -1 });

    const tree = [];
    for (const referral of referrals) {
      const children = await this.getReferralTree(referral._id, depth + 1, maxDepth);
      tree.push({
        ...referral.toObject(),
        children
      });
    }
    
    return tree;
  }

  async calculateTotalNetworkEarnings(userId) {
    const pipeline = [
      {
        $match: { referredBy: userId }
      },
      {
        $lookup: {
          from: 'earnings',
          localField: '_id',
          foreignField: 'userId',
          as: 'earnings'
        }
      },
      {
        $unwind: '$earnings'
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$earnings.amount' }
        }
      }
    ];

    const result = await User.aggregate(pipeline);
    return result[0]?.totalEarnings || 0;
  }
}

export default new ReferralService();