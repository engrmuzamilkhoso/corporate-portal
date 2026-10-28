import jazzcash from '@/assets/operator-logos/jazzcash.png'
import telenor from '@/assets/operator-logos/telenor.png'
import ufone from '@/assets/operator-logos/ufone.png'
import zong from '@/assets/operator-logos/zong.png'
import easypaisa from '@/assets/operator-logos/easypaisa.png'
import ubl from '@/assets/operator-logos/ubl.png'
import onelink from '@/assets/operator-logos/1link.png'
import alfa from '@/assets/operator-logos/alfa.png'
import checkout from '@/assets/operator-logos/checkout.png'
import konnect from '@/assets/operator-logos/konnect.png'
import jsWallet from '@/assets/operator-logos/jsWallet.png'
import nift from '@/assets/operator-logos/nift.png'
import simpaisa from '@/assets/operator-logos/simpaisa.png'
import opay from '@/assets/operator-logos/opay.png'
import ptcl from '@/assets/operator-logos/ptcl.png'
import meezan from '@/assets/operator-logos/meezan.png'
import roshan from '@/assets/operator-logos/roshan.png'

const logos: Record<string, string> = {
  '100001': jazzcash.src,
  '100002': telenor.src,
  '100005': ufone.src,
  '100006': ptcl.src,
  '100003': zong.src,
  '100007': easypaisa.src,
  '100008': jazzcash.src,
  '100009': roshan.src,
  '100010': ubl.src,
  '100011': onelink.src,
  '100012': alfa.src,
  '100013': checkout.src,
  '100014': konnect.src,
  '100015': jsWallet.src,
  '100016': opay.src,  
  '100017': opay.src,  
  '100018': nift.src,
  '100019': meezan.src,
  '100020': easypaisa.src,
}

export const operatorLogo = (operatorID: string | number) => logos[String(operatorID)] || simpaisa.src
