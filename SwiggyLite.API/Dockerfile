# Stage 1: Build .NET API
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY SwiggyLite.API/*.csproj .
RUN dotnet restore

COPY SwiggyLite.API/. .
RUN dotnet publish -c Release -o /app/publish

# Stage 2: Build Frontend
FROM node:20 AS frontend
WORKDIR /frontend

COPY SwiggyLite.Frontend/package*.json ./
RUN npm install

COPY SwiggyLite.API .

COPY SwiggyLite.Frontend/. .
RUN npm run build

# Stage 3: Final Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Copy backend published output
COPY --from=build /app/publish .

# Copy frontend build output (static files)
COPY --from=frontend /frontend/SwiggyLite.API/wwwroot ./wwwroot

EXPOSE 5063
CMD ["dotnet", "SwiggyLite.API.dll"]
