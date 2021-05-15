using Microsoft.Extensions.Configuration;
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
using DatabaseContext;
using Microsoft.EntityFrameworkCore;

namespace QuotePanel
{
    public static class Methods
    {
        public static string CreateToken(List<Claim> claims, string role, DateTime? expires = null)
        {

            ClaimsIdentity claimsIdentity =
                new ClaimsIdentity(claims, "Token", ClaimsIdentity.DefaultNameClaimType, role);

            var jwt = new JwtSecurityToken(
                issuer: AuthOptions.ISSUER,
                audience: AuthOptions.AUDIENCE,
                notBefore: DateTime.Now,
                claims: claimsIdentity.Claims,
                expires: expires ?? DateTime.Now.Add(TimeSpan.FromMinutes(AuthOptions.LIFETIME)),
                signingCredentials: new SigningCredentials(AuthOptions.GetSymmetricSecurityKey(), SecurityAlgorithms.HmacSha256));

            return new JwtSecurityTokenHandler().WriteToken(jwt);
        }

        public static bool IsMainModer(this GroupRole role, bool? forAdmin)
        {
            if (!(forAdmin ?? false))
                return false;

            return (role.Role == UserRole.Moder || role.Role == UserRole.Admin);
        }

        public static bool IsMainAdmin(this GroupRole role, bool? forAdmin)
        {
            if (!(forAdmin ?? false))
                return false;

            return (role.Role == UserRole.Admin);
        }

        public static GroupRole GetDataFromClaims(this DataContext context, ClaimsPrincipal user)
        {
            var claims = user.Claims;

            if (!user.HasClaim(t => t.Type == "RoleId"))
                return null;

            var roleId = int.Parse(claims.First(t => t.Type == "RoleId").Value);
            if (user.HasClaim(t => t.Type == "RoleId"))
                return context.GroupsRoles
                    .Include(t => t.Group)
                    .Include(t => t.User)
                    .SingleOrDefault(t => t.Id == roleId);

            return null;
        }

        
        public static AesManager Manager { get; } = new AesManager();

        public static byte[] EncryptCode(int id)
        {
            try
            {
                var inputBytes = BitConverter.GetBytes(id);
                return Manager.Encryptor.TransformFinalBlock(inputBytes, 0, inputBytes.Length);
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
                var outputBytes = Manager.Decryptor.TransformFinalBlock(encrypted, 0, encrypted.Length);
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

    public class AesManager
    {
        AesManaged aes { get; } = new AesManaged();
        public byte[] Key { get; set; }
        public byte[] IV { get; set; }

        public void SetData(string key, string iv)
        {
            Key = Convert.FromBase64String(key);
            IV = Convert.FromBase64String(iv);
        }

        public void SetData(IConfigurationSection section)
        {
            Key = Convert.FromBase64String(section.GetValue<string>("Key"));
            IV = Convert.FromBase64String(section.GetValue<string>("IV"));
        }

        public ICryptoTransform Encryptor
            => aes.CreateEncryptor(Key, IV);

        public ICryptoTransform Decryptor
            => aes.CreateDecryptor(Key, IV);
    }
}
