using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace QuotePanel
{
    public static class Methods
    {
        public static string CreateToken(List<Claim> claims, string role)
        {

            ClaimsIdentity claimsIdentity =
                new ClaimsIdentity(claims, "Token", ClaimsIdentity.DefaultNameClaimType, role);

            var jwt = new JwtSecurityToken(
                issuer: AuthOptions.ISSUER,
                audience: AuthOptions.AUDIENCE,
                notBefore: DateTime.Now,
                claims: claimsIdentity.Claims,
                expires: DateTime.Now.Add(TimeSpan.FromMinutes(AuthOptions.LIFETIME)),
                signingCredentials: new SigningCredentials(AuthOptions.GetSymmetricSecurityKey(), SecurityAlgorithms.HmacSha256));

            return new JwtSecurityTokenHandler().WriteToken(jwt);
        }

        static AesManaged aes = new AesManaged();
        static byte[] key = Convert.FromBase64String("mwp6/KOL/DDCEuyO9GGw4uxcjPUMAPq+yKuGwTiXqlE=");
        static byte[] IV = Convert.FromBase64String("tUkia+XYhiB0VogjzJQG1g==");

        public static byte[] EncryptCode(int id)
        {
            try
            {
                var inputBytes = BitConverter.GetBytes(id);
                return aes.CreateEncryptor(key, IV).TransformFinalBlock(inputBytes, 0, inputBytes.Length);
            }
            catch
            {
                return null;
            }
        }

        public static int DecryptCode(byte[] encrypted)
        {
            try
            {
                var outputBytes = aes.CreateDecryptor(key, IV).TransformFinalBlock(encrypted, 0, encrypted.Length);
                return BitConverter.ToInt32(outputBytes);
            }
            catch
            {
                return 0;
            }
        }

        public static int DecryptCodeString(string urlEncoded)
            => DecryptCode(Convert.FromBase64String(HttpUtility.UrlDecode(urlEncoded)));

        public static string EncryptCodeString(int id)
            => HttpUtility.UrlEncode(Convert.ToBase64String(EncryptCode(id)));
    }
}
