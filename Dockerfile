FROM mcr.microsoft.com/dotnet/sdk:9.0 AS dotnet
WORKDIR /dotnet
COPY SwiggyLite.API/*.csproj .
RUN dotnet restore
COPY SwiggyLite.API .
RUN dotnet publish -c Release -o /app/publish

FROM node:20 AS node
WORKDIR /node
COPY SwiggyLite.API .
COPY SwiggyLite.Frontend/package*.json ./
RUN npm install
COPY SwiggyLite.Frontend .
RUN npm run build

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=dotnet /app/publish .
COPY --from=node SwiggyLite.API/wwwroot ./wwwroot
EXPOSE 5063
CMD ["dotnet", "SwiggyLite.API.dll"]
